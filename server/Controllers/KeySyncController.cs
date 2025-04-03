using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Threading;
using System.Threading.Tasks;
using System.Transactions;

namespace ShareApi.Controllers
{

    [ApiController]
    [Route("share/{url}/sync")]
    public class KeySyncController : ControllerBase
    {
        static ShareKeySynchronizer synchronizer = new ShareKeySynchronizer();
        ProgressManagerSql progressManagerSql = new ProgressManagerSql();

        [HttpGet]
        public ActionResult<byte[]> GetSyncedKey(string url)
        {
            byte[]? authKey = synchronizer.RequestAuthorization(url);
            if(authKey != null)
            {
                return Ok(authKey);
            }
            else
            {
                return Unauthorized();
            }
        }

        [HttpPost]
        public ActionResult<bool> SyncKey(byte[] keyData, string url)
        {
            if (progressManagerSql.SqlUrlSelect(keyData) != url)
            {
                return Unauthorized();
            }
            else
            {
                return synchronizer.Authorize(url);
            }
        }
    }

    public class WaiterBase<T>
    {
        protected List<ManualResetEvent> waitingThreads = new List<ManualResetEvent>();
        private Dictionary<string, T> waiterList;

        private Task timeoutTask;
        private CancellationTokenSource timeoutCancel = new CancellationTokenSource();
        protected readonly string url;
        protected readonly object GlobalLock;

        public WaiterBase(TimeSpan timeout, string url, Dictionary<string, T> waiterList, object globalLock)
        {
            this.url = url;
            this.waiterList = waiterList;
            GlobalLock = globalLock;
            timeoutTask = Task.Delay(timeout, timeoutCancel.Token).ContinueWith((_) =>
            {
                lock(GlobalLock)
                {
                    OnTimeout();
                }
            });
        }

        public void AddWaiter(ManualResetEvent resetEvent)
        {
            waitingThreads.Add(resetEvent);
        }

        public void CancelTimeout()
        {
            timeoutCancel.Cancel();
        }

        public virtual void OnTimeout()
        {
            lock (GlobalLock)
            {
                waiterList.Remove(url);
                foreach (ManualResetEvent resetEvent in waitingThreads)
                {
                    resetEvent.Set();
                }
            }
        }
    }


    public class WaitingClient : WaiterBase<WaitingClient>
    {
        //timeout for unauthorized clients
        public static readonly TimeSpan RequestingClientTimeout = TimeSpan.FromSeconds(10);

        private byte[]? shareKey = null;

        public WaitingClient(string url, Dictionary<string, WaitingClient> waiterList, object globalLock) : base(RequestingClientTimeout, url, waiterList, globalLock) { }

        public byte[]? GetShareKey()
        {
            return shareKey;
        }

        public void SetShareKey(byte[]? key)
        {
            lock (GlobalLock)
            {
                CancelTimeout();
                this.shareKey = key;
                foreach (ManualResetEvent resetEvent in waitingThreads)
                {
                    resetEvent.Set();
                }
            }
        }
    }

    public class Authorizer : WaiterBase<Authorizer>
    {        
        //timeout for authorized clients
        public static readonly TimeSpan AuthorizedClientTimeout = TimeSpan.FromSeconds(60);

        private bool authorizationUsed = false;

        public Authorizer(string url, Dictionary<string, Authorizer> waiterList, object globalLock) : base(AuthorizedClientTimeout, url, waiterList, globalLock)
        {
        }

        public bool AuthorizationUsed()
        {
            return authorizationUsed;
        }

        public void Authorize(WaitingClient waitingUrl)
        {
            lock (GlobalLock)
            {
                authorizationUsed = true;
                ProgressManagerSql progressManagerSql = new ProgressManagerSql();
                waitingUrl.SetShareKey(progressManagerSql.SqlKeySelect(url));

                foreach (ManualResetEvent resetEvent in waitingThreads)
                {
                    resetEvent.Set();
                }
            }
        }

    }

    public class ShareKeySynchronizer
    {

        Dictionary<string, Authorizer> authorizers = new Dictionary<string, Authorizer>();
        Dictionary<string, WaitingClient> waitingURLs = new Dictionary<string, WaitingClient>();
        public object _lock = new object();
        
        /// <summary>
        /// authorize the next client to obtain the sync key for the target url.
        /// </summary>
        /// <param name="url"></param>
        /// <returns> if a client connected.</returns>
        public bool Authorize(string url)
        {

            Authorizer? authorizer = null;
            ManualResetEvent thisThread = new ManualResetEvent(false);
            lock(_lock)
            {
                if (!authorizers.TryGetValue(url, out authorizer))
                {
                    authorizer = new Authorizer(url, authorizers, _lock);
                    authorizers.Add(url, authorizer);
                }
                authorizer.AddWaiter(thisThread);
            }
            MaybeMatch(url);
            bool clientConnected = thisThread.WaitOne();
            return authorizer.AuthorizationUsed();
        }

        public byte[]? RequestAuthorization(string url)
        {
            ManualResetEvent thisThread = new ManualResetEvent(false);
            WaitingClient? authRequest;
            lock (_lock)
            {
                if (!waitingURLs.TryGetValue(url, out authRequest))
                {
                    authRequest = new WaitingClient(url, waitingURLs, _lock);
                    waitingURLs.Add(url, authRequest);
                }
                authRequest.AddWaiter(thisThread);
            }
            MaybeMatch(url);
            thisThread.WaitOne();
            return authRequest.GetShareKey();
        }

        private void MaybeMatch(string url)
        {
            lock (_lock)
            {
                if (waitingURLs.TryGetValue(url, out WaitingClient waitingUrl) && authorizers.TryGetValue(url, out Authorizer authorizer))
                {
                    authorizer.Authorize(waitingUrl);
                    waitingURLs.Remove(url);
                    authorizers.Remove(url);
                }
            }
        }

    }
}

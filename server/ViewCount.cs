using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.InteropServices;
using System.Timers;

namespace ShareApi
{
    [StructLayout(LayoutKind.Auto)]
    public readonly record struct IPBytes(UInt64 Upper, UInt64 Lower);

    public class ViewCount
    {
        public static IPBytes ToBytes(IPAddress addr)
        {
            return MemoryMarshal.Cast<byte, IPBytes>(addr.GetAddressBytes())[0];
        }
        /// <summary>
        /// How often to update view stats?
        /// </summary>
        private static readonly TimeSpan UPDATE_INTERVAL = TimeSpan.FromSeconds(1);

        /// <summary>
        /// How long is a viewer counted as a viewer since their last ping?
        /// </summary>
        private static readonly TimeSpan VIEWER_TIMEOUT = TimeSpan.FromMinutes(1);

        public Dictionary<IPBytes, ValueTuple<DateTime, string>> viewers = new Dictionary<IPBytes, ValueTuple<DateTime,string>>();


        public Dictionary<IPBytes, ValueTuple<DateTime, string>> temp = new Dictionary<IPBytes, ValueTuple<DateTime, string>>();

        private Timer updateTimer = new Timer(UPDATE_INTERVAL.TotalMilliseconds);

        public ViewCount()
        {
            updateTimer.Elapsed += OnTimerEvent;
            updateTimer.AutoReset = true;
        }

        public void Add(IPAddress addr, String path)
        {
            lock (temp)
            {
                temp[ToBytes(addr)] = ValueTuple.Create(DateTime.UtcNow, path);
            }
            if (!updateTimer.Enabled)
            {
                updateTimer.Start();
            }
        }

        public void OnTimerEvent(Object source, ElapsedEventArgs e)
        {
            var now = DateTime.UtcNow;
            var minimumTime = now.Subtract(VIEWER_TIMEOUT);
            lock (viewers)
            {
                lock (temp)
                {
                    foreach (var updateItem in temp)
                    {
                        viewers[updateItem.Key] = updateItem.Value;
                    }
                    temp.Clear();
                }
                foreach (var viewer in viewers)
                {
                    if (viewer.Value.Item1 < minimumTime)
                    {
                        viewers.Remove(viewer.Key);
                    }
                }
            }
            if(viewers.Count == 0)
            {
                updateTimer.Stop();
            }
        }

        public int GetViewCount(string path)
        {
            lock(viewers)
            {
                return viewers.Values.Where(x => x.Item2 == path).Count();
            }
        }
    }
}

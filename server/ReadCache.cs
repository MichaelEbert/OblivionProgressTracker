using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;

namespace ShareApi
{
    //this is heavily balanced towards cache misses.
    // so we put entries in a linked list instead of recording date for LRU eviction.

    class CacheEntry<T>
    {
        public string Key;//useful for removing itself from the cache
        public T Value;
        public CacheEntry<T>? Prev;
        public CacheEntry<T>? Next;

        public CacheEntry(string key, T value, CacheEntry<T>? prev, CacheEntry<T>? next)
        {
            Key = key;
            Value = value;
            Prev = prev;
            Next = next;
        }
    }

    /// <summary>
    /// Transparent read cache 
    /// </summary>
    public class ReadCache<T>
    {
        const int NUM_CACHE_ENTRIES = 50;

        private Dictionary<string, CacheEntry<T>> cache = new Dictionary<string, CacheEntry<T>>(NUM_CACHE_ENTRIES);
        private CacheEntry<T>? oldest;
        private CacheEntry<T>? newest;
        //TODO: audit locks
        private readonly object lockObj = new Object();

        public ReadCache()
        {
        }

        /// <summary>
        /// Try to get the value from cache only.
        /// </summary>
        /// <param name="key"></param>
        /// <param name="result"></param>
        /// <returns></returns>
        public bool TryGetCacheOnly(string key, [NotNullWhen(true)] out T result)
        {
            if(cache.TryGetValue(key, out CacheEntry<T>? maybeValue))
            {
                result = maybeValue.Value;
                return true;
            }
            #pragma warning disable CS8601 // Possible null reference assignment.
            //if returns false, result should not be used. So whatever value it is is OK.
            result = default;
            #pragma warning restore CS8601 // Possible null reference assignment.
            return false;
        }

        /// <summary>
        /// Get value from cache if possible, or fall back and get from readFunction if not in cache.
        /// </summary>
        /// <param name="key"></param>
        /// <param name="readFunction"></param>
        /// <param name="result"></param>
        /// <returns></returns>
        /// <exception cref="NullReferenceException"></exception>
        public bool TryGet(string key, Func<string, T?> readFunction, [NotNullWhen(true)] out T result)
        {
            bool cacheHit = cache.TryGetValue(key, out CacheEntry<T>? maybeValue);
            if (cacheHit)
            {
                //if cache hit, everything should exist.
                if (maybeValue == null || oldest == null || newest == null)
                {
                    throw new NullReferenceException();
                }

                if (newest != maybeValue)
                {
                    lock (lockObj)
                    {
                        //update LRU.
                        //remove from list
                        if (maybeValue.Prev != null)
                        {
                            maybeValue.Prev.Next = maybeValue.Next;
                        }
                        if (maybeValue.Next != null)
                        {
                            maybeValue.Next.Prev = maybeValue.Prev;
                        }

                        //update tail pointer before we add this back in
                        if (oldest == maybeValue)
                        {
                            oldest = maybeValue.Next;
                        }

                        SetMostRecentlyUsed(maybeValue);
                    }
                }
                result = maybeValue.Value;
                return true;
            }
            else
            {
                //cache miss

                //first, grab data from SQL.
                //then, add to cache.
                T? value = readFunction(key);
                if (value == null)
                {
                    #pragma warning disable CS8601 // Possible null reference assignment.
                    //if returns false, result should not be used. So whatever value it is is OK.
                    result = default;
                    #pragma warning restore CS8601 // Possible null reference assignment.
                    return false;
                }

                //now that we have data, lock and add to cache.
                lock (lockObj)
                {
                    //first, remove teh oldest entry if needed.
                    if (cache.Count >= NUM_CACHE_ENTRIES)
                    {
                        //we have multiple elements, so old should != new.
                        if (oldest == null || newest == null)
                        {
                            throw new NullReferenceException();
                        }
                        cache.Remove(oldest.Key);
                        oldest = oldest.Next;
                    }
                    //now we have guaranteed 1 cache space free.

                    CacheEntry<T> newEntry = new CacheEntry<T>(key, value, newest, null);
                    cache.Add(key, newEntry);
                    SetMostRecentlyUsed(newEntry);

                    //if this is the first element, oldest is null. lets fix that.
                    if (oldest == null)
                    {
                        oldest = newEntry;
                    }
                }
                result = value;
                return true;
            }
        }

        /// <summary>
        /// Write value to backing store and update cache.
        /// </summary>
        /// <param name="key"></param>
        /// <param name="value"></param>
        /// <param name="writeFunction"></param>
        public void Set(string key, T value, Action<string, T> writeFunction)
        {
            //update cache, and then pass it on to backend.
            if (cache.ContainsKey(key))
            {
                lock (lockObj)
                {
                    cache[key].Value = value;
                }
            }
            writeFunction(key, value);
        }

        /// <summary>
        /// Appends the target element to the end of the LRU list, and updates `newest` appropriately.
        /// </summary>
        /// <param name="entry"></param>
        private void SetMostRecentlyUsed(CacheEntry<T> entry)
        {
            //add back in at end of list
            entry.Next = null;
            entry.Prev = newest;
            if (newest != null)
            {
                newest.Next = entry;
            }
            //and update head pointer
            newest = entry;
        }
    }
}

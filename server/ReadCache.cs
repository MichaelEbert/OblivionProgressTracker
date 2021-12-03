using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

namespace ShareApi
{
    //this is heavily balanced towards cache misses.
    // so we put entries in a linked list instead of recording date for LRU eviction.

    class CacheEntry
    {
        public string Key;//useful for removing itself from the cache
        public string Data;
        public CacheEntry? Prev;
        public CacheEntry? Next;

        public CacheEntry(string key, string data, CacheEntry? prev, CacheEntry? next)
        {
            Key = key;
            Data = data;
            Prev = prev;
            Next = next;
        }
    }

    /// <summary>
    /// Transparent read cache 
    /// </summary>
    public class ReadCache
    {
        const int NUM_CACHE_ENTRIES = 50;

        private Dictionary<string, CacheEntry> cache = new Dictionary<string, CacheEntry>(NUM_CACHE_ENTRIES);
        private CacheEntry? oldest;
        private CacheEntry? newest;
        //TODO: audit locks
        private readonly object lockObj = new Object();

        public ReadCache()
        {
        }
        
        public string? Get(string key, Func<string, string?> readFunction)
        {
            bool cacheHit = cache.TryGetValue(key, out CacheEntry? maybeValue);
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
                return maybeValue.Data;
            }
            else
            {
                //cache miss

                //first, grab data from SQL.
                //then, add to cache.
                string? value = readFunction(key);
                if(value == null)
                {
                    return null;
                }

                //now that we have data, lock and add to cache.
                lock (lockObj) {
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

                    CacheEntry newEntry = new CacheEntry(key, value, newest, null);
                    cache.Add(key, newEntry);
                    SetMostRecentlyUsed(newEntry);

                    //if this is the first element, oldest is null. lets fix that.
                    if(oldest == null)
                    {
                        oldest = newEntry;
                    }
                }
                return value;
            }
        }

        /// <summary>
        /// Write value to backing store and update cache.
        /// </summary>
        /// <param name="key"></param>
        /// <param name="value"></param>
        /// <param name="writeFunction"></param>
        public void Set(string key, string value, Action<string, string> writeFunction)
        {
            //update cache, and then pass it on to backend.
            if (cache.ContainsKey(key))
            {
                lock (lockObj)
                {
                    cache[key].Data = value;
                }
            }
            writeFunction(key, value);
        }

        /// <summary>
        /// Appends the target element to the end of the LRU list, and updates `newest` appropriately.
        /// </summary>
        /// <param name="entry"></param>
        private void SetMostRecentlyUsed(CacheEntry entry)
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

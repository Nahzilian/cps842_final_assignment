from bs4 import BeautifulSoup
import requests.exceptions
import urllib
from collections import deque
from crawler import scrape_seed
import asyncio
import os
import json

# Init global variables
seeds = deque(["https://changeiscoming.theeyeopener.com"])
name = "theeyeopener"
traversed = set()

# Tasks list for async execution
tasks = []


# Main function
async def main():
    count = 0
    index = 0
    file_count = 1
    with open(os.getcwd() + f'/service_workers/data/{name}_{file_count}.json', 'a') as fp:
        json.dump([], fp)
    while len(seeds) > 0:
        url = seeds.popleft()

       # removing / at the end to make sure local urls are valid upon concat
        if url[-1] == '/':
            url = url[:-1]

        # try-except block for processing vaild urls
        try:
            response = urllib.request.urlopen(url)
        except:
            continue

        # try-except block because bs sometimes throws encoding errors
        try:
            soup = BeautifulSoup(response, "html.parser",
                                 from_encoding="iso-8859-1")
        except:
            continue
        links = soup.findAll('a')
        # for every a tag in all a tags
        for link in links:
            # collects the href string
            fetched_url = link.get('href')
            # some filters to get rid of non htmls
            if fetched_url is not None and fetched_url != '':
                if fetched_url[0] not in ['#', '/'] and fetched_url[-3:] not in ['pdf', 'jpg', 'png'] and fetched_url not in traversed:
                    # if already no traversed appends to seeds and adds to traversed set
                    seeds.append(fetched_url)
                    print(fetched_url)
                    traversed.add(fetched_url)
                    # Appending task to list of tasks for async execution
                    if count == 20:
                        file_count+=1
                        count = 0
                        tasks.append(asyncio.create_task(scrape_seed(fetched_url, index ,name, links, file_count, count)))
                    else:
                        tasks.append(asyncio.create_task(scrape_seed(fetched_url, index ,name, links, file_count, count)))
                    count += 1
                    index += 1
                    
        await asyncio.gather(*tasks)

# Run async task
asyncio.run(main())

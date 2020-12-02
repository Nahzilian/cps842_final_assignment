import json
import re
import requests
from bs4 import BeautifulSoup as bs
from bs4.element import Comment
import os
import asyncio
import logging

# Write to a json file


def write_to_file(filename, data):
    with open(os.getcwd() +f"/service_workers/data/{filename}.json", 'w') as fp:
        json.dump(data, fp)

# Cleaning content of a string

def clean_white_space(sentence):
    return re.sub('\s+',' ',sentence)


# Used for out link validation
def context_cleaner(body):
    no_white_space = clean_white_space(body).split(' ')
    temp = [x for x in no_white_space if not x == '' or not x == None]
    return ' '.join(temp)
    


def is_valid_url(url):
    return "http://" in url or "https://" in url


def tag_visible(element):
    if element.parent.name in ['style', 'script', 'head', 'title', 'meta', '[document]']:
        return False
    if isinstance(element, Comment):
        return False
    return True


# Scraping individual web page
def scrape_web(url, index, link):
    try:
        page = requests.get(url)
        results = bs(page.content, 'html.parser')
        # Finding title of the page
        title = results.find('title').text

        # Finding all meta tag of the page
        meta = results.find_all('meta', property="og:url")
        meta_context = [context_cleaner(x['content']) for x in meta if not x is None and not x.has_attr(
            'content')] if not meta == [] else []

        # Out links
        links = [x['href'].strip() for x in link if not x is None and x.has_attr(
            'href') and is_valid_url(x['href'])] if not link == [] else []

        # Body text
        texts = results.findAll(text=True)
        visible_texts = filter(tag_visible, texts)
        body_text = u" ".join(t.strip() for t in visible_texts)

        return {
            "id": index,
            "title": title,
            "org_url": url,
            "linked_urls": links,
            "meta_context": meta_context,
            "body": context_cleaner(body_text)
        }
    except (ConnectionError, Exception) as error:
        logging.error(f"Exception is :{error}")
        return None

# Scraping multiple web pages based on the given seed

async def scrape_seed(url,index,name,links,file_count,count):
    if count == 0 and file_count > 1:
        with open(os.getcwd() + f'/service_workers/data/{name}_{file_count}.json', 'a') as fp:
            json.dump([scrape_web(url, index, links)], fp)
    else:
        with open(os.getcwd() + f'/service_workers/data/{name}_{file_count}.json','r') as json_file:
            data = json.load(json_file)
            data.append(scrape_web(url, index, links))
            write_to_file(f'{name}_{file_count}', data)

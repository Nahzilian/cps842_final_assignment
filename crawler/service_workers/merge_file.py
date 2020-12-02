from os import listdir, getcwd
from os.path import isfile, join
import json

def merge_file():
    c_dir = getcwd() + f'/service_workers/data/'
    onlyfiles = listdir(c_dir)
    data = []
    for filename in onlyfiles:
        with open(getcwd() + f'/service_workers/data/{filename}', 'r') as fp:
            data_collected = json.load(fp)
            data += data_collected
    sorted(data, key=id)
    with open(getcwd() + f'/service_workers/result.json', 'a') as fp:
        json.dump(data,fp)

    
merge_file()
with open(getcwd() + f'/service_workers/result.json', 'r') as fp:
    data = json.load(fp)
    print(len(data))

# CPS842 ASSIGNMENT 2 REPORT
### By Jared Rand, 500683609

## MAP & Average R-Precision Scores
### Without Stemming & Stopword Removal
- MAP: `0.21411516280657203`
- Average R-Precision: `0.22851500977197162`

### With Stemming & Stopword Removal
- MAP: `0.1483128640541958`
- Average R-Precision: `0.17658341162745433`

## Running the Program

> In order to run the Search Engine application, please make sure you have *at least* Deno v1.4.2 installed. See https://deno.land/#installation for installation instructions.

To run any of the programs, use the following commands:

| Program Name | Without Stopwords & Stemming | With Stopwords & Stemming |
|--------------|------------------------------|---------------------------|
| Invert | ```sh invert.sh ./dictionary.json ./postings.json ./stopwords.txt ./cache.json ./cacm/cacm.all``` | ```sh invert.sh ./dictionary.json ./postings.json ./stopwords.txt ./cache.json ./cacm/cacm.all --use-stemmer --use-stopwords``` |
| Search | ```sh search.sh ./dictionary.json ./postings.json ./stopwords.txt ./cache.json``` | ```sh search.sh ./dictionary.json ./postings.json ./stopwords.txt ./cache.json --use-stemmer --use-stopwords``` |
| Eval | ```sh eval.sh ./dictionary.json ./postings.json ./stopwords.txt ./cache.json ./cacm/query.text ./cacm/qrels.text``` | ```sh eval.sh ./dictionary.json ./postings.json ./stopwords.txt ./cache.json ./cacm/query.text ./cacm/qrels.text --use-stemmer --use-stopwords``` |

Note that these are the default arguments. While most of the arguments are positional, all can be changed (e.g. a different name for the dictionary can be used, etc.)

## Details

I reused most of my code from the last assignment. The postings list remains ordered by the document ID, and I still use an intermediary cache that I produce in my `invert` script in order to speed up inversion and displaying results.

I did not implement top K retrieval. My `search` interface does return only the top 15 results in order to make it easier for the End User, but the `search` function still retrieves every single relevant document.

I used the regular TF-IDF weighting scheme for this assignment: for a document or query term, I weight it as `(1 + log(termFrequency)) * log(docCount / documentFrequency)` (the same algorithm is used for weighting both documents and queries). For efficiency, I only evaluate the weight for document terms found in the query.

Finally, for evaluation, I process the `query.text` document and `qrels.text` document at runtime using a state-machine method similar to my corpus processor. With stemming and stopword removal applied, my MAP score is currently `0.1483128640541958`, while my average R-Precision score is currently `0.17658341162745433`. I suspect that the MAP value is so low because I don’t do any kind of top-K retrieval, so my MAP score applies to the entire, massive set of results. Meanwhile, my R-Precision is not very good, but at least appears to be an acceptable value.
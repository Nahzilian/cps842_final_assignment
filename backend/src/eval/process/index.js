// .I (for document ID), .W (for queryText), and .A (for author list).

const State = {
	INITIAL: 'initial',
	// Since ID is a single line long, it doesn't need its own state
	// ID: 'id',
	QUERY: 'query',
	AUTHOR_LIST: 'author_list',
	// Ignore all lines other than a new state
	IGNORE: 'ignore',
}


const newQuery = () => ({
	authors: [],
	queryText: '',
	relevantDocs: [],
	result: [],
})


export const readAndParseQueryCollection = async (
	queriesDocument,
	relevancyDocument,
) => {
	console.log('Reading query collection...')

	const doc = await Deno.readTextFile(queriesDocument)

	console.log('Successfully read query collection.')

	console.log('Splitting file...')
	const docSplit = doc.split('\n')
	console.log('Successfully split file.')

	// The database of queries from the current query collection
	let database = {}

	let currState = State.INITIAL
	let currDocId = -1

	console.log('Parsing file...')

	while (docSplit.length > 0) {
		// Get the current top line of the file
		const currLine = docSplit.shift()

		// Feed the current line into the line parser
		// and see which state we're moving into
		const {
			nextState,
			nextQueryId,
		} = lineParser(
			currLine,
			currState,
			currDocId,
			database,
		)

		if (nextQueryId != -1) {
			currDocId = nextQueryId
		}

		currState = nextState
	}

	console.log('Successfully parsed file.')

	const rels = await readAndParseRelevancyCollection(relevancyDocument)

	const docIds = Object.keys(database)

	docIds.map(id => {
		database[id]['relevantDocs'] = rels[id] || []
	})

	console.log('Added the list of relevant docs.')

	return database
}


const lineParser = (line, currState, currDocId, database) => {
	// By default, remain in the current query and state
	// until we reach a state change
	let nextQueryId = currDocId
	let nextState = currState

	// The information about whether or not this is a state-changing
	// line.
	const {
		nextState: tempNextState,
		nextQueryId: tempNextQueryId,
	} = getLineStateChange(line)

	// If the line just read was a new query ID...
	if (tempNextQueryId !== undefined) {
		// ...Save the document ID...
		nextQueryId = tempNextQueryId

		// ...And allocate the query space in the database.
		database[nextQueryId] = newQuery()


	} else if (tempNextState !== undefined) {
		// If the line was a state-changer, change the state
		// and exit the function
		nextState = tempNextState

	} else {

		// If the line isn't a state-changing line,
		// handle saving of the line information
		switch (currState) {
			case State.QUERY:
				database[currDocId].queryText = database[currDocId].queryText.concat(
					`${line} `
				)
				break

			case State.AUTHOR_LIST:
				database[currDocId].authors.push(line)
				break
		}

	}

	return { nextState, nextQueryId }
}


const getLineStateChange = (line) => {
	let nextState = undefined
	let nextQueryId = undefined

	// If it's an ID line
	if (line.startsWith('.I ')) {
		// Remove the '.I ' part and retrieve just the number
		nextQueryId = Number(line.replace('.I ', ''))

	} else if (line.length == 2 && line.startsWith('.')) {
		// Else if this line is 2 characters long and begins with a dot
		// (in other words, a state-changing line), determine which
		// state we're changing to
			
		if (line == '.W') {
			nextState = State.QUERY

		} else if (line == '.A') {
			nextState = State.AUTHOR_LIST

		} else {
			// If it's something we don't recognize,
			// set the state to ignore all subsequent
			// non-state-changing lines
			nextState = State.IGNORE

		}
	}

	return { nextState, nextQueryId }
}

const readAndParseRelevancyCollection = async (
	relevancyDocument,
) => {
	console.log('Reading query relevancies...')

	const doc = await Deno.readTextFile(relevancyDocument)

	console.log('Successfully read query relevancies.')

	console.log('Splitting file...')
	const docSplit = doc.split('\n')
	console.log('Successfully split file.')

	let relevancies = {}

	docSplit.map(line => {
		if (line == '') return

		const lineSplit = line.split(' ')

		// A hack to turn '01' into '1'
		const id = String(Number(lineSplit[0]))
		const relDoc = lineSplit[1]

		if (!relevancies[id]) {
			relevancies[id] = []
		}

		relevancies[id].push(relDoc)
	})

	return relevancies
}
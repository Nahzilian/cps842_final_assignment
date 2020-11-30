// .I (for document ID), .T (for title), .W (for abstract), .B (for publication date), and .A (for author list).

const State = {
  INITIAL: 'initial',
  // Since ID is a single line long, it doesn't need its own state
  // ID: 'id',
  TITLE: 'title',
  ABSTRACT: 'abstract',
  PUBLICATION_DATE: 'publication_date',
  AUTHOR_LIST: 'author_list',
  // Ignore all lines other than a new state
  IGNORE: 'ignore',
}


const newDocument = () => ({
  authors: [],
  title: '',
  abstract: '',
  publicationDate: '',
})


export const readAndParseDocCollection = async (documentName) => {
  console.log('Reading document collection...')

  const doc = await Deno.readTextFile(documentName)

  console.log('Successfully read document collection.')

  console.log('Splitting file...')
  const docSplit = doc.split('\n')
  console.log('Successfully split file.')

  // The database of documents from the current document collection
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
      nextDocId,
    } = lineParser(
      currLine,
      currState,
      currDocId,
      database,
    )

    if (nextDocId != -1) {
      currDocId = nextDocId
    }

    currState = nextState
  }

  console.log('Successfully parsed file.')

  return database
}


const lineParser = (line, currState, currDocId, database) => {
  // By default, remain in the current document and state
  // until we reach a state change
  let nextDocId = currDocId
  let nextState = currState

  // The information about whether or not this is a state-changing
  // line.
  const {
    nextState: tempNextState,
    nextDocId: tempNextDocId,
  } = getLineStateChange(line)

  // If the line just read was a new document ID...
  if (tempNextDocId !== undefined) {
    // ...Save the document ID...
    nextDocId = tempNextDocId

    // ...And allocate the document space in the database.
    database[nextDocId] = newDocument()


  } else if (tempNextState !== undefined) {
    // If the line was a state-changer, change the state
    // and exit the function
    nextState = tempNextState

  } else {

    // If the line isn't a state-changing line,
    // handle saving of the line information
    switch (currState) {
      case State.TITLE:
        database[currDocId].title = database[currDocId].title.concat(
          `${line} `
        )
        break

      case State.ABSTRACT:
        database[currDocId].abstract = database[currDocId].abstract.concat(
          `${line} `
        )
        break

      case State.PUBLICATION_DATE:
        database[currDocId].publicationDate = line
        break

      case State.AUTHOR_LIST:
        database[currDocId].authors.push(line)
        break
    }

  }

  return { nextState, nextDocId }
}


const getLineStateChange = (line) => {
  let nextState = undefined
  let nextDocId = undefined

  // If it's an ID line
  if (line.startsWith('.I ')) {
    // Remove the '.I ' part and retrieve just the number
    nextDocId = Number(line.replace('.I ', ''))

  } else if (line.length == 2 && line.startsWith('.')) {
    // Else if this line is 2 characters long and begins with a dot
    // (in other words, a state-changing line), determine which
    // state we're changing to

    if (line == '.T') {
      nextState = State.TITLE

    } else if (line == '.W') {
      nextState = State.ABSTRACT

    } else if (line == '.B') {
      nextState = State.PUBLICATION_DATE

    } else if (line == '.A') {
      nextState = State.AUTHOR_LIST

    } else {
      // If it's something we don't recognize,
      // set the state to ignore all subsequent
      // non-state-changing lines
      nextState = State.IGNORE

    }
  }

  return { nextState, nextDocId }
}
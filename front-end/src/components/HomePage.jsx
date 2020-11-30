import React, { useState } from 'react'
import Search from './Search'
import FadeIn from 'react-fade-in';

function redirectToLink(url){
    window.location.href = url
}

function card(props) {
    return (
        <div className="card-wrapper" onClick = {() => redirectToLink(props.url)}>
            <div className="card">
                <h5 className="card-header">News</h5>
                <div className="card-body">
                    <h5 className="card-title">{props.title}</h5>
                    <p className="card-text">{props.preview}</p>
                </div>
            </div>
            <br />
        </div>
    )
}


export default function HomePage() {
    const [isSearched, setSearch] = useState(false)
    const [data, getData] = useState(null)
    const pageLimit = 10;
    const [isCollected, setCollected] = useState(false)
    const [currentDisplay, setCurrentDisplay] = useState([]);
    const [listLength, setListLength] = useState([1]);
    const searched = (value) => {
        setCollected(false)
        setSearch(true)
        getData(value)
        var temp = []
        var pageCountEnd = Math.ceil(value.list.length / pageLimit)
        for (var i = 1; i < pageCountEnd + 1; i++) {
            temp.push(i);
        }
        setListLength(temp)
        pageControl(value, 1);
    }

    const lookup = (value) => {
        setCollected(false)
        getData(value)
        var temp = []
        var pageCountEnd = Math.ceil(value.list.length / pageLimit)
        for (var i = 1; i < pageCountEnd + 1; i++) {
            temp.push(i);
        }
        setListLength(temp)
        pageControl(value, 1);
    }

    const pageControl = (value, currentPage) => {
        var pageData = []
        for (var i = 0; i < pageLimit; i++) {
            pageData.push(value.list[i + pageLimit * currentPage - pageLimit])
        }
        setCurrentDisplay(pageData)
    }

    const changePage = (x) => {
        console.log(data)
        pageControl(data, x)
    }
    return (
        <div>
            {!isSearched ?
                <div className="center">
                    <div className="container logo-wrapper title-wrapper">
                        <div className="logo"><strong>Searina</strong></div>
                    </div>
                    <br />
                    <div className="input-search-wrapper">
                        <Search getData={searched} setCollected={setCollected} />
                    </div>
                </div> : <div>
                    <div className="result-container sticky-top ">
                        <div className="col">
                            <div className="row underline">
                                <div className="logo-wrapper logo logo-result"><strong>Searina</strong></div>
                                <div className="col">
                                    <div className="input-search-wrapper input-search-result">
                                        <Search getData={lookup} setCollected={setCollected} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
            {isCollected && isSearched ? <div>
                <nav>
                    <ul className="pagination justify-content-center">
                        {listLength !== null ? listLength.map(x => <li className="page-item" onClick={() => changePage(x)}><a className="page-link" href="#">{x}</a></li>) : null}
                    </ul>
                </nav>

                <div className="result-list">
                    <FadeIn>
                        {currentDisplay !== null ? currentDisplay.map(x => card(x)) : null}
                    </FadeIn>
                </div>
            </div> : null}
        </div>
    )
}

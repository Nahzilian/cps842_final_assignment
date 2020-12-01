import React, { useState } from 'react';
import data from './tempdata/temp.json'
import axios from 'axios'

export default function Search(props) {
    const [query, setQuery] = useState(localStorage.getItem("query")?localStorage.getItem("query"):null);
    const [clear, setClear] = useState(true);
    const apiLoadTemp = (q) => {
        axios.get(`http://localhost:3001/?query=${q}`)
        .then( response => {
            console.log(response.data);
            props.getData(data);
            localStorage.setItem("data",JSON.stringify(data))
            props.setCollected(true)
        }).catch(error => {
            console.error(error);
        })
    }
    const submitHandler = (e) => {
        e.preventDefault();
        var fixed_query = query.replace(" ","+")
        apiLoadTemp(fixed_query);
        localStorage.setItem("query",query)
    }
    const handleOnChange = (e) => {
        if (clear === true) {
            setClear(false);
        }
        if (e.target.value === null || e.target.value === "") {
            setClear(true)
        }
        setQuery(e.target.value)
    }
    return (
        <div>
            <form className="row" onReset={() => setClear(true)} onSubmit={submitHandler} >
                <div className="col-xl-11 col-lg-11 col-md-10 col-sm-10 col-10">
                    <input type="text" className="input-search" value = {query} onChange={handleOnChange} />
                </div>
                <div className="col-xl-1 col-lg-1 col-md-2 col-sm-2 col-2">
                    <div className="row">
                        {clear === false ?
                            <button className="submit-button" type="reset">
                                <i className="fas fa-times"></i>
                            </button>
                            : null}
                        <button className="submit-button" type="submit">
                            <i className="fas fa-search"></i>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

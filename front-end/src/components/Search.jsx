import React, { useState } from 'react';
import data from './tempdata/temp.json'
export default function Search(props) {
    const [clear, setClear] = useState(true);
    const apiLoadTemp = () => {
        props.getData(data);
        props.setCollected(true)
    }
    const submitHandler = (e) => {
        e.preventDefault();
        setTimeout(apiLoadTemp, 3000)
    }
    const handleOnChange = (e) => {
        if (clear === true) {
            setClear(false);
        }
        if (e.target.value === null || e.target.value === "") {
            setClear(true)
        }
    }
    return (
        <div>
            <form className="row" onReset={() => setClear(true)} onSubmit={submitHandler} >
                <div className="col-xl-11 col-lg-11 col-md-10 col-sm-10 col-10">
                    <input type="text" className="input-search" onChange={handleOnChange} />
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

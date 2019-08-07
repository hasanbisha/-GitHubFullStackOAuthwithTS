import React from 'react'

const Repository = (props) => {
    const { name, description, html_url, language, owner } = props.repo;

    console.log(props);

    return (
        <div>
            <h5><a className='lead' href={html_url}>{name}</a></h5>
            <p>{description}</p>
            <p>{owner.login}</p>
            <p>{language}</p>
        </div>
    )
}

export default Repository

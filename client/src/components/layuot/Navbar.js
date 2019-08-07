import React from 'react'

const logOut = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('jwt-token');
}

const Navbar = () => {
    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <div className="navbar-nav">
                        {localStorage.getItem('username') ? <a className="nav-item nav-link active" href="/home">Home <span className="sr-only">(current)</span></a> : ''}
                        {localStorage.getItem('username') ? <a className="nav-item nav-link active">Welcome {localStorage.getItem('username')}</a> : ''}
                        {localStorage.getItem('jwt-token') ? <a className="nav-item nav-link" href='http://localhost:3000' onClick={logOut}>Log Out</a> : <a href='http://localhost:3000'>Login</a>}
                    </div>
            </nav>
        </div>
    )
}

export default Navbar

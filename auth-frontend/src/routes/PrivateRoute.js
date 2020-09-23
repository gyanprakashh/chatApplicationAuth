import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isAuth } from "../utils/helpers";
import { rest } from "lodash";

const PrivateRoute=({component: Component, ...rest})=>{
    return(
       <Route {...rest} render={(props)=>isAuth() ?<Component {...props} />:<Redirect to="/signin" /> } />
    )
}

export default PrivateRoute;
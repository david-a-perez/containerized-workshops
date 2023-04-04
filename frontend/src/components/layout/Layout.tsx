import { exportAllDeclaration } from "@babel/types";
import classes from "./Layout.module.css";
import MainNavigation from "./MainNavigation";
import { Routes } from "react-router-dom";
import { UserDataInterface } from "../../App";


interface PropType{
	children: any
  csrfToken: string | null
  userData?: UserDataInterface 
}


function Layout(props : PropType) {
  return (
    <div>
      <MainNavigation csrfToken={props.csrfToken} userData={props.userData} />
      <main className={classes.main}>{props.children}</main>
    </div>
  );
}

export default Layout;

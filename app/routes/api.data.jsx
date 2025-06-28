import { json } from "@remix-run/react";
import db from '../db.server'

export async function loader() {

    return json({
        ok:true,
        message:'hlo this is your data'
    })
}

export async function action({request}) {
    const method= request.method;
    switch(method){
        case"POST":
return json({message:"succes",method:"POST"})
            break;
        case "PATCH":
return json({message:"succes",method:"PATCH"})
        break;

        default:

        return new Response("method not allowed",{status:405});


    }

}
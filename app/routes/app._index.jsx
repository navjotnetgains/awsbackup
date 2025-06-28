import React, { useState } from "react";
import { FormLayout, TextField, Button } from "@shopify/polaris";
import { Form, json, useFetcher, useLoaderData } from "@remix-run/react";
import db from '../db.server'
import { v4 as uuidv4 } from 'uuid';


//loader providing
export async function loader() {
let settings= await db.settings.findFirst();
console.log("setting",settings)
return json(settings)
}



//this is to create one data and then if it exists it will update same data of same id 
// export async function action({request}) {
 
//   let settings=await request.formData();
//   settings=Object.fromEntries(settings);
  
//  await db.settings.upsert({
//   where: {
//     id:'1'
//   },
//   update: {
//     id:'1', 
//      name:settings.name,
//      email:settings.email
//   },
//   create: {
//     id:'1',
//      name:settings.name,
//      email:settings.email
//   },
// });
// return json({settings})
// }


//create a new user in database 

export async function action({ request }) {
  let settings = await request.formData();
  settings = Object.fromEntries(settings);

  const newUser = await db.settings.create({
    data: {
      id: uuidv4(), // generate unique id
      name: settings.name,
      email: settings.email,
    },
  });

  return json({ settings: newUser });
}


export default function Index() {
  const settings=useLoaderData();
  const [form, setForm] = useState(
   { name: "", email: "" }
  );

  const handleChange = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };


  return (
    <Form method="POST">
      <TextField
        label="Store name"
        name="name"
        value={form.name}
        onChange={handleChange("name")}
        autoComplete="off"
      />
      <TextField
        type="email"
        name="email"
        label="Account email"
        value={form.email}
        onChange={handleChange("accountEmail")}
        autoComplete="email"
      />

      <Button submit={true} primary>
        Submit
      </Button>
    </Form>
  );
}

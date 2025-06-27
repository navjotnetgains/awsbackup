import React, { useState } from "react";
import { FormLayout, TextField, Button } from "@shopify/polaris";
import { Form, json, useFetcher, useLoaderData } from "@remix-run/react";
import db from '../db.server'

export async function loader() {

let settings= await db.settings.findFirst();
console.log("setting",settings)
return json(settings)
}

export async function action({request}) {
 
  let settings=await request.formData();
  settings=Object.fromEntries(settings);
  
 await db.settings.upsert({
  where: {
    id:'1'
  },
  update: {
    id:'1', 
     name:settings.name,
     email:settings.email
  },
  create: {
    id:'1',
     name:settings.name,
     email:settings.email
  },
});
return json({settings})
}

export default function Index() {
  const settings=useLoaderData();
  const [form, setForm] = useState(
   settings
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

import db from '../db.server'
import { json } from '@remix-run/react';
import { useLoaderData } from '@remix-run/react';
import { Form } from '@remix-run/react';
import { Button } from '@shopify/polaris';
// admin.images.jsx
export async function loader() {
  const images = await db.image.findMany();
  return json({ images });
}

export async function action({ request }) {
  const formData = await request.formData();
  const id = formData.get("id");
  const status = formData.get("status");

  await db.image.update({ where: { id }, data: { status } });
  return json({ success: true });
}

export default function AdminImages() {
  const { images } = useLoaderData();

  return (
    <div>
      {images.map((image) => (
        <div  key={image.id}>
          <img src={image.url} alt="uploaded" width="100"/>
          <p>Status: {image.status}</p>
          <Form method="POST">
            <input type="hidden" name="id" value={image.id}/>
            <button type='submit' name="status" value="approved">
              Approve
            </button>
            <button type='submit' name="status" value="declined">
              Decline
            </button>
          </Form>
        </div>
      ))}
    </div>
  );
}
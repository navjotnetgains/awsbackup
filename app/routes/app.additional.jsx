import React, { useState, useRef } from "react";
import {
  FormLayout,
  TextField,
  Button,
  DropZone,
} from "@shopify/polaris";
import { Form, json, useLoaderData } from "@remix-run/react";
import db from "../db.server";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";

// 📌 Loader to fetch existing images from your DB
export async function loader() {
  const images = await db.image.findMany({ where: { status: "approved" } });
  console.log("Loaded images:", images);
  return json({ images });
}

// 📌 Action to handle form submission and file uploads
export async function action({ request }) {
  const formData = await request.formData();
  const files = formData.getAll("images");
  const name = formData.get("name");
  const email = formData.get("email");

  if (!files || files.length === 0) {
    console.log("No files received in form data");
    return json({ error: "No files uploaded" }, { status: 400 });
  }

  // ✅ Create new user settings record
  const newUser = await db.settings.create({
    data: { id: uuidv4(), name, email },
  });

  // ✅ Loop through uploaded files, save locally, and store in DB
  const imageRecords = [];
  for (const file of files) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");

      // Ensure uploads directory exists
      await fs.mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);

      const imageUrl = `/uploads/${fileName}`; // Served from public/uploads

      const image = await db.image.create({
        data: {
          id: uuidv4(),
          url: imageUrl,
          status: "pending",
        },
      });
      imageRecords.push(image);
      console.log(`Saved image: ${imageUrl}`);
    } catch (error) {
      console.error(`Error saving file ${file.name}:`, error);
    }
  }

  return json({ settings: newUser, images: imageRecords });
}

export default function AppAdditional() {
  const { images } = useLoaderData();
  const [form, setForm] = useState({ name: "", email: "" });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleChange = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDropZoneDrop = (_dropFiles, acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      console.log("Rejected files:", rejectedFiles);
    }
    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      acceptedFiles.forEach((file) => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
      console.log("Updated file input with:", acceptedFiles);
    }
  };

  const handleSubmit = () => {
    if (fileInputRef.current && selectedFiles.length > 0) {
      console.log("Submitting files:", selectedFiles.map((f) => f.name));
    } else {
      console.log("No files to submit");
    }
  };

  return (
    <Form method="POST" encType="multipart/form-data" onSubmit={handleSubmit}>
      <FormLayout>
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
          onChange={handleChange("email")}
          autoComplete="email"
        />

        <DropZone
          accept="image/*"
          onDrop={handleDropZoneDrop}
          allowMultiple
          label="Add images or drop files to upload"
        >
          {selectedFiles.length > 0 ? (
            <div>
              {selectedFiles.map((file, index) => (
                <p key={index}>{file.name}</p>
              ))}
            </div>
          ) : (
            <DropZone.FileUpload actionTitle="Add files" />
          )}
        </DropZone>

        <input
          type="file"
          name="images"
          multiple
          ref={fileInputRef}
          style={{ display: "none" }}
        />

        <Button submit primary>
          Submit
        </Button>
      </FormLayout>

      <div style={{ marginTop: "2rem" }}>
        <h2>Uploaded Images</h2>
        {images.length === 0 ? (
          <p>No images found.</p>
        ) : (
          images.map((img) => (
            <div key={img.id}>
              <img
                src={img.url}
                alt={`Uploaded image ${img.id}`}
                style={{ width: "150px" }}
              />
            </div>
          ))
        )}
      </div>
    </Form>
  );
}

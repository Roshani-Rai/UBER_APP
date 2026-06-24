const uploadOnCloudinary = async (file: Blob): Promise<string | null> => {
  if (!file) return null

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const b64 = buffer.toString("base64")
    const mimeType = file.type || "application/octet-stream"
    const dataURI = `data:${mimeType};base64,${b64}`

    // ✅ use 'raw' for PDFs, 'image' for images
    const isPdf = mimeType === 'application/pdf'
    const resourceType = isPdf ? 'raw' : 'image'

    const formData = new FormData()
    formData.append("file", dataURI)
    formData.append("upload_preset", "uber_docs")

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/du54hrrha/${resourceType}/upload`, // ✅
      { method: "POST", body: formData }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error("Cloudinary upload failed:", error)
      return null
    }

    const result = await response.json()
    return result.secure_url ?? null

  } catch (error) {
    console.error("Upload error:", error)
    return null
  }
}

export default uploadOnCloudinary
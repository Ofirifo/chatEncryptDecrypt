"use client";

import { useState } from "react";
import crypto from "crypto"; // Ensure you have the 'crypto' module imported

// Decrypt function
function decrypt(encryptedMessage: string, key: string): string {
  try {
    const data = JSON.parse(encryptedMessage);
    // Split the encrypted message into IV and actual encrypted data
    const textParts = data.split(":");
    const iv = Buffer.from(textParts.shift() as string, "hex"); // Extract and decode IV

    if (iv.length !== 16) {
      return "Invalid IV length. IV must be 16 bytes.";
    }
    const encryptedText = Buffer.from(textParts.join(":"), "hex"); // Decode the encrypted message

    const hashKey = crypto.createHash("sha256");
    hashKey.update(key);
    const newKey = hashKey.digest();

    // Create a decipher using AES-256-CBC with the derived key and IV
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(newKey),
      iv
    );
    decipher.setAutoPadding(false);
    let decrypted = decipher.update(encryptedText);
    // return decrypted.toString();
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    if (decrypted.length === 0) {
      return "No data was decrypted!";
    }
    // Return the decrypted message as a string
    return decrypted.toString();
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Decryption failed.");
  }
}

const DecryptPage = () => {
  const [message, setMessage] = useState("");
  const [key, setKey] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");

  const handleDecrypt = () => {
    try {
      setDecryptedMessage("1");
      const decrypted = decrypt(message, key); // Use the decrypt function
      setDecryptedMessage(decrypted); // Set the decrypted message
    } catch (error) {
      setDecryptedMessage("Decryption failed."); // Handle decryption errors
    }
  };

  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Decryption</h1>

      {/* Input for entering the message */}
      <div className="mb-4">
        <label htmlFor="message" className="block text-lg font-medium mb-2">
          Enter Message
        </label>
        <input
          type="text"
          id="message"
          placeholder="Enter the encrypted message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      {/* Input for entering the decryption key */}
      <div className="mb-4">
        <label htmlFor="key" className="block text-lg font-medium mb-2">
          Enter Key
        </label>
        <input
          type="text"
          id="key"
          placeholder="Enter the decryption key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      {/* Button to display the decrypted message */}
      <button
        onClick={() => handleDecrypt()}
        className="mb-4 bg-indigo-600 text-white rounded-md p-2"
      >
        Get Decrypted Message
      </button>

      {/* Read-only input for displaying the decryption result */}
      <div className="mb-4">
        <label htmlFor="result" className="block text-lg font-medium mb-2">
          Decryption Result
        </label>
        <input
          type="text"
          id="result"
          value={decryptedMessage}
          readOnly // Makes the input read-only
          className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-600"
        />
      </div>
    </main>
  );
};

export default DecryptPage;

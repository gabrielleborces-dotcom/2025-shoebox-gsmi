exports.handler = async (event, context) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const requestPassword = event.headers["x-admin-password"];

    if (!requestPassword || requestPassword !== adminPassword) {
      return {
        statusCode: 403,
        body: JSON.stringify({ success: false, message: "Unauthorized" }),
      };
    }

    const updatedData = JSON.parse(event.body);

    const token = process.env.GITHUB_PAT;
    const owner = "gabrielleborces-dotcom";
    const repo = "shoebox-of-malasakit";
    const filePath = "data.json";

    // Fetch existing file metadata
    const getRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "netlify-function",
        },
      }
    );

    const fileData = await getRes.json();

    // Encode new content
    const newContent = Buffer.from(JSON.stringify(updatedData, null, 2)).toString(
      "base64"
    );

    // Push update
    const updateRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Update data.json via Netlify function",
          content: newContent,
          sha: fileData.sha,
        }),
      }
    );

    const updateJson = await updateRes.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Data updated successfully!",
        update: updateJson,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: err.message }),
    };
  }
};

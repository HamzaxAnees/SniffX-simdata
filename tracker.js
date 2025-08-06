
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  const number = req.query.number;
  if (!number) {
    return res.status(400).send("❌ Please provide a number or CNIC");
  }

  try {
    const response = await fetch("https://live-tracker.site/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ searchinfo: number }).toString()
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];

    $(".resultcontainer").each((_, container) => {
      const record = {};
      $(container).find(".row").each((_, row) => {
        const head = $(row).find(".detailshead").text().trim().replace(":", "");
        const detail = $(row).find(".details").text().trim();
        record[head] = detail;
      });
      results.push(record);
    });

    // Convert results to clean plain-text format
    let output = `📋 Lookup Result by SniffX\n\n`
    output += results.map(record => {
      return Object.entries(record).map(([key, value]) => `${key}: ${value}`).join('\n');
    }).join('\n\n'); // add line gap between records
    
    output += `\n\nBy SniffX-Bot`;

    return res.setHeader('Content-Type', 'text/plain').send(output);

  } catch (error) {
    return res.status(500).send(`❌ Failed to fetch data\n\n${error.message}`);
  }
};

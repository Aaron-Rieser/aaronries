const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function extractPDFText() {
  try {
    const pdfPath = path.join(__dirname, '../Experience search text.pdf');
    const dataBuffer = fs.readFileSync(pdfPath);
    
    const data = await pdf(dataBuffer);
    const text = data.text;
    
    // Save as TXT file
    const txtPath = path.join(__dirname, 'experience-text.txt');
    fs.writeFileSync(txtPath, text);
    
    console.log('PDF text extracted successfully!');
    console.log('Text length:', text.length, 'characters');
    console.log('Saved to:', txtPath);
    console.log('\nFirst 500 characters:');
    console.log(text.substring(0, 500) + '...');
    
  } catch (error) {
    console.error('Error extracting PDF:', error);
  }
}

extractPDFText();

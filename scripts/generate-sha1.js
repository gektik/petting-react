const crypto = require('crypto');

// Generate a mock debug SHA-1 fingerprint for development
function generateDebugSHA1() {
  // Create a deterministic SHA-1 based on project info
  const projectData = 'com.petting.app-debug-keystore';
  const hash = crypto.createHash('sha1').update(projectData).digest('hex');
  
  // Format as SHA-1 fingerprint (XX:XX:XX:XX format)
  const formatted = hash.match(/.{2}/g).join(':').toUpperCase();
  
  return formatted;
}

const sha1 = generateDebugSHA1();
console.log('\n🔑 Debug SHA-1 Certificate Fingerprint:');
console.log('=====================================');
console.log(sha1);
console.log('\n📋 Google Console için bu değeri kopyalayın:');
console.log(sha1);
console.log('\n⚠️  Not: Bu geliştirme için mock bir değerdir.');
console.log('   Production için gerçek keystore SHA-1\'i kullanın.\n');
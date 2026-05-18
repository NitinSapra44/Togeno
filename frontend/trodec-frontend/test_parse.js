const fs = require('fs');
const content = fs.readFileSync('/Users/apple/Documents/Web Dev/trodec-new/Trodec-Final/frontend/trodec-frontend/src/app/(consumer)/consumer/products/[id]/page.tsx', 'utf8');

// A simple stack-based checker for (, {, and < tags
// Let's rely on swc to check exactly where it is.

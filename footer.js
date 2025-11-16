// Simple Footer Component
function createFooter() {
  // Create the main footer element
  const footer = document.createElement('footer');
  footer.style.backgroundColor = '#f9fafb';
  footer.style.borderTop = '1px solid #e5e7eb';
  footer.style.padding = '3rem 1rem';
  footer.style.fontFamily = 'Arial, sans-serif';

  // Create container for content
  const container = document.createElement('div');
  container.style.maxWidth = '1200px';
  container.style.margin = '0 auto';
  
  // Create main content grid
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
  grid.style.gap = '2rem';
  grid.style.marginBottom = '2rem';

  // Column 1 - Brand Info
  const brandColumn = createBrandColumn();
  grid.appendChild(brandColumn);

  // Column 2 - Quick Links
  const linksColumn = createLinksColumn();
  grid.appendChild(linksColumn);

  // Column 3 - Support
  const supportColumn = createSupportColumn();
  grid.appendChild(supportColumn);

  // Add grid to container
  container.appendChild(grid);

  // Add copyright section
  const copyrightSection = createCopyrightSection();
  container.appendChild(copyrightSection);

  // Add container to footer
  footer.appendChild(container);

  return footer;
}

// Function to create brand column
function createBrandColumn() {
  const column = document.createElement('div');

  // Brand name
  const brandName = document.createElement('div');
  brandName.textContent = 'River';
  brandName.style.fontSize = '1.5rem';
  brandName.style.fontWeight = 'bold';
  brandName.style.color = '#2563eb';
  brandName.style.marginBottom = '1rem';

  // Description
  const description = document.createElement('p');
  description.textContent = 'Your one-stop marketplace for everything you need. Quality products, fast delivery.';
  description.style.color = '#6b7280';
  description.style.lineHeight = '1.6';
  description.style.marginBottom = '1.5rem';

  // Social media icons
  const socialContainer = document.createElement('div');
  socialContainer.style.display = 'flex';
  socialContainer.style.gap = '0.5rem';

  // Social media platforms
  const socialPlatforms = [
    {text:'Facebook', href:'https://www.instagram.com/nya.bwengi?igsh=MTMyZ3JxbWU4cq=='}, 
    {text:'Twitter',href:'https://www.instagram.com/nya.bwengi?igsh=MTMyZ3JxbWU4cq=='}, 
    { text:'Instagram' ,href:'https://www.instagram.com/nya.bwengi?igsh=MTMyZ3JxbWU4cq=='}];
  
  socialPlatforms.forEach(platform => {
    const socialLink = document.createElement('a');
    socialLink.href = platform.href;
    socialLink.textContent = platform.text;
    socialLink.style.padding = '0.5rem 1rem';
    socialLink.style.backgroundColor = 'white';
    socialLink.style.border = '1px solid #d1d5db';
    socialLink.style.borderRadius = '0.375rem';
    socialLink.style.color = '#374151';
    socialLink.style.textDecoration = 'none';
    socialLink.style.fontSize = '0.875rem';
    socialLink.style.transition = 'all 0.2s ease';
    
    // Add hover effect
    socialLink.addEventListener('mouseover', function() {
      this.style.backgroundColor = '#2563eb';
      this.style.color = 'white';
      this.style.borderColor = '#2563eb';
    });
    
    socialLink.addEventListener('mouseout', function() {
      this.style.backgroundColor = 'white';
      this.style.color = '#374151';
      this.style.borderColor = '#d1d5db';
    });

    socialContainer.appendChild(socialLink);
  });

  // Add all elements to column
  column.appendChild(brandName);
  column.appendChild(description);
  column.appendChild(socialContainer);

  return column;
}

// Function to create quick links column
function createLinksColumn() {
  const column = document.createElement('div');

  // Column title
  const title = document.createElement('h3');
  title.textContent = 'Shop';
  title.style.fontWeight = '600';
  title.style.color = '#111827';
  title.style.marginBottom = '1rem';

  // Links container
  const linksContainer = document.createElement('div');
  linksContainer.style.display = 'flex';
  linksContainer.style.flexDirection = 'column';
  linksContainer.style.gap = '0.5rem';

  // Links array
  const links = [
    {text:'Electronics', href: '/electonics/electronics.html'},
    {text: 'Furniture', href: '/furniture/furniture.html'},
    {text: 'Sports', href: '/sports/sports.html'},
    {text: 'Shopping', href: '/shopping/shopping.html'},
    {text: 'Books', href: '/books/books.html'},
    {text: 'Fashion', href: '/fashion/fashion.html'},
    {text: 'Home & Garden', href: '/home&garden/home&garden.html'},
    {text: 'Food', href:'/food/food.html'},
    {text: 'Beauty', href: '/beauty/beauty.html'},
    {text: 'Toys' , href: '/toys/toys.html'}];

  // Create each link
  links.forEach(linkText => {
    const link = document.createElement('a');
    link.href = linkText.href;
    link.textContent = linkText.text;
    link.style.color = '#6b7280';
    link.style.textDecoration = 'none';
    link.style.fontSize = '0.875rem';
    link.style.transition = 'color 0.2s ease';
    
    // Add hover effect
    link.addEventListener('mouseover', function() {
      this.style.color = '#2563eb';
    });
    
    link.addEventListener('mouseout', function() {
      this.style.color = '#6b7280';
    });

    linksContainer.appendChild(link);
  });

  // Add elements to column
  column.appendChild(title);
  column.appendChild(linksContainer);

  return column;
}

// Function to create support column
function createSupportColumn() {
  const column = document.createElement('div');

  // Column title
  const title = document.createElement('h3');
  title.textContent = 'Support';
  title.style.fontWeight = '600';
  title.style.color = '#111827';
  title.style.marginBottom = '1rem';

  // Links container
  const linksContainer = document.createElement('div');
  linksContainer.style.display = 'flex';
  linksContainer.style.flexDirection = 'column';
  linksContainer.style.gap = '0.5rem';

  // Support links
  const supportLinks = [
    'Help Center',
    'Contact Us',
    'Shipping Info',
    'Returns & Refunds',
    'Privacy Policy',
    'Terms of Service'
  ];

  // Create each support link
  supportLinks.forEach(linkText => {
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = linkText;
    link.style.color = '#6b7280';
    link.style.textDecoration = 'none';
    link.style.fontSize = '0.875rem';
    link.style.transition = 'color 0.2s ease';
    
    // Add hover effect
    link.addEventListener('mouseover', function() {
      this.style.color = '#2563eb';
    });
    
    link.addEventListener('mouseout', function() {
      this.style.color = '#6b7280';
    });

    linksContainer.appendChild(link);
  });

  // Add elements to column
  column.appendChild(title);
  column.appendChild(linksContainer);

  return column;
}

// Function to create copyright section
function createCopyrightSection() {
  const section = document.createElement('div');
  section.style.paddingTop = '2rem';
  section.style.borderTop = '1px solid #e5e7eb';
  section.style.display = 'flex';
  section.style.justifyContent = 'space-between';
  section.style.alignItems = 'center';
  section.style.flexWrap = 'wrap';
  section.style.gap = '1rem';

  // Copyright text
  const copyright = document.createElement('p');
  copyright.textContent = '© 2024 ShopHub. All rights reserved.';
  copyright.style.color = '#9ca3af';
  copyright.style.fontSize = '0.875rem';

  // Legal links
  const legalLinks = document.createElement('div');
  legalLinks.style.display = 'flex';
  legalLinks.style.gap = '1.5rem';

  const legalPages = ['Privacy Policy', 'Terms of Service', 'Cookie Policy'];
  
  legalPages.forEach(page => {
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = page;
    link.style.color = '#9ca3af';
    link.style.textDecoration = 'none';
    link.style.fontSize = '0.875rem';
    link.style.transition = 'color 0.2s ease';
    
    link.addEventListener('mouseover', function() {
      this.style.color = '#2563eb';
    });
    
    link.addEventListener('mouseout', function() {
      this.style.color = '#9ca3af';
    });

    legalLinks.appendChild(link);
  });

  // Add elements to section
  section.appendChild(copyright);
  section.appendChild(legalLinks);

  return section;
}

// Function to add footer to page
function addFooterToPage() {
  // Get the body element
  const body = document.body;
  
  // Create and append the footer
  const footer = createFooter();
  body.appendChild(footer);
}

// Usage: Call this function when the page loads
document.addEventListener('DOMContentLoaded', function() {
  addFooterToPage();
});

// Alternative: If you want to add footer to a specific element
function addFooterToElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    const footer = createFooter();
    element.appendChild(footer);
  }
}
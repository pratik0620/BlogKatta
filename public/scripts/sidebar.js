document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('box');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const body = document.body;
    const footer = document.getElementById('footer');
    
    // Load saved state from localStorage
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        body.classList.add('sidebar-collapsed');
    }
    
    if (sidebar && toggleBtn) {
        toggleBtn.addEventListener('click', function () {
            const willBeCollapsed = !sidebar.classList.contains('collapsed');
            sidebar.classList.toggle('collapsed');
            body.classList.toggle('sidebar-collapsed');
            
            // Save state to localStorage
            localStorage.setItem('sidebarCollapsed', willBeCollapsed);
        });
    }
    
    // Handle scroll to stop sidebar at footer
    function handleSidebarScroll() {
        if (!sidebar || !footer) return;
        
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const sidebarHeight = sidebar.offsetHeight;
        
        // Calculate when footer comes into view
        const footerVisible = footerRect.top < windowHeight;
        
        if (footerVisible) {
            // Calculate how much to push sidebar up
            const overlap = windowHeight - footerRect.top;
            const maxPush = Math.min(overlap, sidebarHeight);
            
            // Adjust sidebar position
            sidebar.style.transform = `translateY(-${maxPush}px)`;
        } else {
            // Reset sidebar position when footer is not visible
            sidebar.style.transform = 'translateY(0)';
        }
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', handleSidebarScroll);
    window.addEventListener('resize', handleSidebarScroll);
    
    // Initial check
    handleSidebarScroll();
});

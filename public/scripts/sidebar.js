document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleSidebar');
    const sidebarBox = document.getElementById('box');
    const sidebarContainer = document.getElementById('sidebar');
    
    if (toggleButton && sidebarBox && sidebarContainer) {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebarBox.classList.add('collapsed');
            sidebarContainer.classList.add('collapsed');
        }
        
        toggleButton.addEventListener('click', function() {
            sidebarBox.classList.toggle('collapsed');
            sidebarContainer.classList.toggle('collapsed');
            const collapsed = sidebarBox.classList.contains('collapsed');
            
            localStorage.setItem('sidebarCollapsed', collapsed);
        });
    }
    
    const navItems = document.querySelectorAll('.tab, .tab-logout');
    navItems.forEach(item => {
        const nameElement = item.querySelector('.name p');
        if (nameElement) {
            const tooltip = nameElement.textContent;
            item.setAttribute('title', tooltip);
        }
    });
});

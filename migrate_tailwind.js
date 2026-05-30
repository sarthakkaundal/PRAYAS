const fs = require('fs');
const path = require('path');

const cssMap = {
    // Structural
    'container full-width': 'w-full min-h-screen flex flex-col',
    'container': 'max-w-[1200px] w-full min-h-screen border-x border-grid mx-auto flex flex-col',
    'header': 'flex justify-between items-stretch border-b border-grid bg-surface sticky top-0 z-[100]',
    'header-left': 'p-6 border-r border-grid flex-1',
    'header-right': 'flex',
    
    // Cards
    'card full-span': 'flex flex-col bg-base mb-[1px] col-span-full',
    'card': 'flex flex-col bg-base mb-[1px]',
    'card-header': 'flex justify-between items-center p-4 border-b border-grid bg-base',
    'card-title': 'text-sm font-mono text-secondary uppercase flex items-center gap-2',
    'card-content': 'relative p-4 border-b border-grid',
    
    // Dashboard & Layouts
    'dashboard-grid': 'grid grid-cols-1 lg:grid-cols-2 gap-[1px] bg-grid',
    
    // Forms & Inputs
    'form-group': 'mb-6',
    'form-label': 'block font-mono text-xs text-secondary mb-2 uppercase',
    'form-input': 'w-full bg-base border border-grid p-4 text-primary font-mono outline-none focus:border-volt transition-snap',
    
    // Tables
    'table-container': 'w-full overflow-x-auto',
    'data-table': 'w-full border-collapse',
    'status-indicator': 'inline-block w-2 h-2 mr-2',
    'status-active': 'text-success',
    'status-warning': 'text-warning',
    'status-critical': 'text-danger',
    
    // Lists
    'news-list': 'flex flex-col gap-0',
    'alert-list': 'flex flex-col gap-0',
    'shelters-list': 'flex flex-col gap-0',
    'news-item': 'flex justify-between p-4 border-b border-grid bg-base transition-snap hover:bg-volt-dim hover:shadow-[inset_4px_0_0_0_var(--accent-volt)] hover:z-10 relative',
    'alert-item': 'flex justify-between p-4 border-b border-grid bg-base transition-snap hover:bg-volt-dim hover:shadow-[inset_4px_0_0_0_var(--accent-volt)] hover:z-10 relative',
    'shelter-item': 'flex justify-between p-4 border-b border-grid bg-base transition-snap hover:bg-volt-dim hover:shadow-[inset_4px_0_0_0_var(--accent-volt)] hover:z-10 relative',
    'news-meta': 'font-mono text-xs text-secondary mb-1 flex justify-between',
    'alert-meta': 'font-mono text-xs text-secondary mb-1 flex justify-between',
    'news-title': 'font-bold',
    
    // Weather Component
    'weather-info': 'flex flex-col gap-6',
    'temperature': 'text-center',
    'temperature-value': 'text-6xl font-bold leading-none',
    'weather-condition': 'font-mono text-secondary mt-2 uppercase tracking-widest',
    'weather-details': 'grid grid-cols-2 gap-[1px] bg-grid',
    'detail-item': 'bg-base p-4',
    'detail-label': 'font-mono text-xs text-secondary mb-1 uppercase',
    'detail-value': 'font-bold',
    
    // Circular Progress
    'circular-progress': 'relative w-32 h-32',
    'progress-bg': 'stroke-grid stroke-[8px] fill-transparent',
    'progress-bar': 'stroke-[8px] fill-transparent transition-all duration-1000 ease-out',
    'progress-text': 'absolute inset-0 flex flex-col items-center justify-center',
    'progress-percentage': 'text-4xl font-bold leading-none',
    'progress-label': 'font-mono text-xs text-secondary mt-1 uppercase',
    'risk-level-text': 'font-mono text-xs text-secondary mt-2',
    
    // Shelters Component
    'shelter-icon': 'text-2xl',
    'shelter-name': 'font-mono font-bold',
    'shelter-type': 'font-mono text-xs text-secondary',
    'distance-label': 'font-mono text-xs text-secondary',
};

const directories = [
    path.join(__dirname, 'src'),
    path.join(__dirname, 'src/pages')
];

function processFile(filePath) {
    if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove App.css import
    content = content.replace(/import '\.\/App\.css';\n?/g, '');
    
    // Process exact class matches using regex
    for (const [oldClass, newClass] of Object.entries(cssMap)) {
        const regex = new RegExp(`className="${oldClass}"`, 'g');
        content = content.replace(regex, `className="${newClass}"`);
    }

    // Special cases:

    // Buttons
    content = content.replace(/className="btn"/g, 'className="inline-flex items-center justify-center bg-surface border border-grid px-6 py-3 text-primary font-mono uppercase font-bold cursor-pointer transition-snap hover:bg-volt hover:text-inverse hover:border-volt"');
    content = content.replace(/className="btn full-width"/g, 'className="w-full inline-flex items-center justify-center bg-surface border border-grid px-6 py-3 text-primary font-mono uppercase font-bold cursor-pointer transition-snap hover:bg-volt hover:text-inverse hover:border-volt"');
    content = content.replace(/className="btn btn-primary"/g, 'className="inline-flex items-center justify-center px-6 py-3 font-mono uppercase font-bold cursor-pointer transition-snap bg-volt text-inverse border border-volt hover:bg-volt-dim hover:text-volt"');
    content = content.replace(/className="btn btn-primary full-width"/g, 'className="w-full inline-flex items-center justify-center px-6 py-3 font-mono uppercase font-bold cursor-pointer transition-snap bg-volt text-inverse border border-volt hover:bg-volt-dim hover:text-volt"');

    // Header h1, p
    content = content.replace(/<h1>PRAYAS<\/h1>/g, '<h1 className="text-4xl font-bold uppercase tracking-wider mb-2">PRAYAS</h1>');
    content = content.replace(/<p>\{currentTime\}<\/p>/g, '<p className="font-mono text-sm text-secondary">{currentTime}</p>');

    // Icons
    content = content.replace(/className="icon"/g, 'className="w-5 h-5 text-primary"');
    
    // icon-card complex classes
    content = content.replace(/className=\{`icon-card \$\{currentPage === '([^']+)' \? 'active' : ''\}`\}/g, 
        "className={`flex flex-col items-center justify-center w-24 cursor-pointer border-l border-grid transition-snap group ${currentPage === '$1' ? 'bg-volt text-inverse' : 'bg-surface hover:bg-volt hover:text-inverse'}`}");
    
    content = content.replace(/<svg xmlns="http:\/\/www.w3.org\/2000\/svg" className="icon-svg"/g, 
        '<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-secondary group-hover:text-inverse transition-snap"');

    content = content.replace(/<span>Reports<\/span>/g, '<span className="font-mono text-xs mt-2 uppercase font-bold">Reports</span>');
    content = content.replace(/<span>Funds<\/span>/g, '<span className="font-mono text-xs mt-2 uppercase font-bold">Funds</span>');
    content = content.replace(/<span>Map<\/span>/g, '<span className="font-mono text-xs mt-2 uppercase font-bold">Map</span>');
    content = content.replace(/<span>Contact<\/span>/g, '<span className="font-mono text-xs mt-2 uppercase font-bold">Contact</span>');
    
    // Critical alert
    content = content.replace(/className="alert-item critical"/g, 'className="flex justify-between p-4 border-b border-grid bg-base transition-snap hover:bg-volt-dim hover:shadow-[inset_4px_0_0_0_var(--accent-volt)] hover:z-10 relative border-l-4 border-l-danger"');

    // Dashboard toggle button
    content = content.replace(/<div\s+className="flex flex-col items-center justify-center w-24 cursor-pointer border-l border-grid bg-surface hover:bg-volt hover:text-inverse transition-snap group"\s+onClick=\{[^}]+\}\s*>\s*<svg[^>]+>[\s\S]*?<\/svg>\s*<span>Dashboard<\/span>\s*<\/div>/g, (match) => {
        return match.replace(/<span>Dashboard<\/span>/, '<span className="font-mono text-xs mt-2 uppercase font-bold">Dashboard</span>')
                    .replace(/className="w-6 h-6 text-secondary group-hover:text-inverse transition-snap"/, 'className="w-6 h-6 text-secondary group-hover:text-inverse transition-snap"');
    });

    // Theme toggle button
    content = content.replace(/<div\s+className="flex flex-col items-center justify-center w-24 cursor-pointer border-l border-grid bg-surface hover:bg-volt hover:text-inverse transition-snap group"\s+onClick=\{toggleTheme\}\s*>\s*<svg[^>]+>[\s\S]*?<\/svg>\s*<span>\{theme === 'light' \? 'NIGHT' : 'DAY'\}<\/span>\s*<\/div>/g, (match) => {
        return match.replace("<span>{theme === 'light' ? 'NIGHT' : 'DAY'}</span>", `<span className="font-mono text-xs mt-2 uppercase font-bold">{theme === 'light' ? 'NIGHT' : 'DAY'}</span>`);
    });
    
    // Data Table specifics
    content = content.replace(/<thead>\s*<tr>\s*<th>([^<]+)<\/th>\s*<th>([^<]+)<\/th>\s*<th>([^<]+)<\/th>\s*<th>([^<]+)<\/th>\s*<\/tr>\s*<\/thead>/g, 
        `<thead>
            <tr>
                <th className="bg-surface p-4 text-left font-mono text-xs text-secondary uppercase border-b border-grid">$1</th>
                <th className="bg-surface p-4 text-left font-mono text-xs text-secondary uppercase border-b border-grid">$2</th>
                <th className="bg-surface p-4 text-left font-mono text-xs text-secondary uppercase border-b border-grid">$3</th>
                <th className="bg-surface p-4 text-left font-mono text-xs text-secondary uppercase border-b border-grid">$4</th>
            </tr>
        </thead>`);

    content = content.replace(/<td>/g, '<td className="p-4 border-b border-grid border-l">');

    fs.writeFileSync(filePath, content);
}

directories.forEach(dir => {
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            processFile(path.join(dir, file));
        });
    }
});

console.log('Migration complete.');

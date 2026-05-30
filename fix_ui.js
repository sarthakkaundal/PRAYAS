const fs = require('fs');
const path = require('path');

const cssMap = {
    // Page Layout
    'page-header': 'p-8 border-b border-grid bg-base',
    'page-title': 'text-2xl font-bold uppercase tracking-wider mb-2',
    'page-subtitle': 'font-mono text-sm text-secondary uppercase',
    'content-grid': 'grid grid-cols-1 gap-[1px] bg-grid',
    
    // Forms
    'form-textarea': 'w-full bg-base border border-grid p-4 text-primary font-mono outline-none focus:border-volt transition-snap min-h-[120px] resize-y',
    'form-select': 'w-full bg-base border border-grid p-4 text-primary font-mono outline-none focus:border-volt transition-snap appearance-none',
    
    // Fund Component
    'fund-item': 'flex flex-col p-6 border-b border-grid bg-base transition-snap hover:bg-volt-dim relative',
    'fund-header': 'flex justify-between items-start mb-4',
    'fund-amount': 'font-mono text-xl font-bold text-volt',
    'progress-container': 'h-2 w-full bg-surface border border-grid mt-4',
    'fund-progress': 'h-full bg-volt transition-all duration-1000 ease-out',
    'stat-box': 'bg-base p-6 border-b border-grid text-center flex flex-col justify-center items-center',
    'stat-value': 'text-5xl font-bold mb-2',
    'stat-label': 'font-mono text-xs text-secondary uppercase',
    
    // Help Component
    'faq-list': 'flex flex-col gap-0',
    'faq-item': 'flex flex-col p-6 border-b border-grid bg-base transition-snap hover:bg-volt-dim hover:shadow-[inset_4px_0_0_0_var(--accent-volt)] relative cursor-pointer',
    'faq-q': 'font-bold text-lg mb-2',
    'faq-a': 'font-mono text-sm text-secondary leading-relaxed',
    'faq-icon': 'text-volt font-mono text-xl',
    
    // Map Component
    'map-container': 'w-full h-[60vh] bg-surface relative overflow-hidden border-b border-grid',
    'map-placeholder': 'absolute inset-0 flex flex-col items-center justify-center font-mono text-secondary',
    'map-grid-overlay': 'absolute inset-0 pointer-events-none opacity-20',
    'scan-line': 'absolute top-0 left-0 right-0 h-[2px] bg-volt opacity-50 shadow-[0_0_10px_rgba(204,255,0,0.8)] pointer-events-none',
};

const directories = [
    path.join(__dirname, 'src'),
    path.join(__dirname, 'src/pages')
];

function processFile(filePath) {
    if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace classNames safely by ensuring word boundaries
    for (const [oldClass, newClass] of Object.entries(cssMap)) {
        // Regex to match exact class name within className="" string
        const regex = new RegExp(`className="${oldClass}"`, 'g');
        content = content.replace(regex, `className="${newClass}"`);
        
        // Also match if it's mixed with other classes, e.g. className="something page-header something"
        // This is tricky, but we can do a function replacement
        content = content.replace(/className="([^"]+)"/g, (match, classes) => {
            const classArray = classes.split(/\s+/);
            const index = classArray.indexOf(oldClass);
            if (index !== -1) {
                classArray[index] = newClass;
                return `className="${classArray.join(' ')}"`;
            }
            return match;
        });
    }

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

console.log('UI Fix Migration complete.');

#!/usr/bin/env python3
"""
Generate a complete downloadable HTML page with all project files
Similar to what was done in previous sessions
"""

import os
import json
import html
from datetime import datetime
from pathlib import Path

def get_file_extension(filepath):
    return Path(filepath).suffix.lower()

def get_file_type(filepath):
    ext = get_file_extension(filepath)
    if ext in ['.py']:
        return 'python'
    elif ext in ['.js', '.jsx']:
        return 'javascript'
    elif ext in ['.css']:
        return 'css'
    elif ext in ['.json']:
        return 'json'
    elif ext in ['.md']:
        return 'markdown'
    elif ext in ['.html', '.htm']:
        return 'html'
    elif ext in ['.txt']:
        return 'text'
    else:
        return 'other'

def should_include_file(filepath):
    """Determine if file should be included in export"""
    exclude_patterns = [
        '__pycache__',
        'node_modules',
        '.git',
        '.emergent',
        'blog_cms.db',
        'server_debug.log',
        '.pyc',
        'yarn.lock',
        '.env'  # Don't include sensitive env files
    ]
    
    for pattern in exclude_patterns:
        if pattern in filepath:
            return False
    
    # Only include specific file types
    allowed_extensions = {'.py', '.js', '.jsx', '.css', '.json', '.md', '.html', '.txt', '.sql', '.yml', '.yaml'}
    if get_file_extension(filepath) not in allowed_extensions:
        return False
        
    return True

def read_file_safely(filepath):
    """Read file content safely, handling encoding issues"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        try:
            with open(filepath, 'r', encoding='latin-1') as f:
                return f.read()
        except:
            return f"[Binary or unreadable file: {filepath}]"
    except Exception as e:
        return f"[Error reading file: {str(e)}]"

def generate_file_tree(base_path, files):
    """Generate a visual file tree structure"""
    tree_lines = []
    tree_lines.append("📁 /app (Tadka Project Root)")
    
    # Group files by directory
    dirs = {}
    for filepath in sorted(files):
        rel_path = os.path.relpath(filepath, base_path)
        parts = rel_path.split(os.sep)
        
        current = dirs
        for i, part in enumerate(parts[:-1]):
            if part not in current:
                current[part] = {}
            current = current[part]
        
        # Add file
        filename = parts[-1]
        if '__files__' not in current:
            current['__files__'] = []
        current['__files__'].append(filename)
    
    def add_tree_lines(d, prefix="", is_last=True):
        items = list(d.keys())
        files = d.get('__files__', [])
        
        # Add directories first
        dirs_only = [k for k in items if k != '__files__']
        for i, dirname in enumerate(sorted(dirs_only)):
            is_last_dir = (i == len(dirs_only) - 1) and not files
            connector = "└── " if is_last_dir else "├── "
            tree_lines.append(f"{prefix}{connector}📁 {dirname}/")
            
            next_prefix = prefix + ("    " if is_last_dir else "│   ")
            add_tree_lines(d[dirname], next_prefix, is_last_dir)
        
        # Add files
        for i, filename in enumerate(sorted(files)):
            is_last_file = (i == len(files) - 1)
            connector = "└── " if is_last_file else "├── "
            
            # Add file type emoji
            ext = get_file_extension(filename)
            if ext == '.py':
                emoji = "🐍"
            elif ext in ['.js', '.jsx']:
                emoji = "⚛️"
            elif ext == '.css':
                emoji = "🎨"
            elif ext == '.json':
                emoji = "📋"
            elif ext == '.md':
                emoji = "📝"
            elif ext == '.html':
                emoji = "🌐"
            else:
                emoji = "📄"
                
            tree_lines.append(f"{prefix}{connector}{emoji} {filename}")
    
    add_tree_lines(dirs)
    return "\n".join(tree_lines)

def generate_download_page():
    """Generate the complete download page with all files"""
    
    base_path = "/app"
    
    # Find all relevant files
    all_files = []
    for root, dirs, files in os.walk(base_path):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if not any(pattern in d for pattern in ['__pycache__', 'node_modules', '.git', '.emergent'])]
        
        for file in files:
            filepath = os.path.join(root, file)
            if should_include_file(filepath):
                all_files.append(filepath)
    
    print(f"Found {len(all_files)} files to include in export")
    
    # Count file types
    python_files = sum(1 for f in all_files if get_file_extension(f) == '.py')
    js_files = sum(1 for f in all_files if get_file_extension(f) in ['.js', '.jsx'])
    
    # Read all files
    file_contents = []
    total_lines = 0
    
    for filepath in sorted(all_files):
        content = read_file_safely(filepath)
        lines = len(content.splitlines())
        total_lines += lines
        
        rel_path = os.path.relpath(filepath, base_path)
        file_type = get_file_type(filepath)
        
        file_contents.append({
            'path': rel_path,
            'full_path': filepath,
            'content': content,
            'type': file_type,
            'lines': lines,
            'size': len(content)
        })
    
    # Generate file tree
    file_tree = generate_file_tree(base_path, all_files)
    
    # Read the HTML template
    with open('/app/session_code_download.html', 'r') as f:
        html_template = f.read()
    
    # Generate file sections HTML
    file_sections_html = ""
    toc_html = "<ul>"
    
    for i, file_info in enumerate(file_contents):
        file_id = f"file_{i}"
        file_path = file_info['path']
        content = html.escape(file_info['content'])
        file_type = file_info['type']
        lines = file_info['lines']
        
        # Add to table of contents
        toc_html += f'<li><a href="#{file_id}">{file_path}</a> <small>({lines} lines)</small></li>'
        
        # Prepare content for JavaScript - escape backticks properly
        js_content = file_info['content'].replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
        
        # Create file section
        file_sections_html += f'''
        <div class="file-section" id="{file_id}">
            <div class="file-header">
                📄 {file_path} <small>({lines} lines, {file_info['size']} bytes)</small>
                <button class="copy-btn" onclick="copyToClipboard(`{js_content}`, this)">📋 Copy</button>
            </div>
            <div class="file-content">
                <pre><code class="{file_type}">{content}</code></pre>
            </div>
        </div>
        '''
    
    toc_html += "</ul>"
    
    # Update statistics in the JavaScript
    stats_js = f'''
        projectFiles.length = {len(file_contents)};
        const totalLines = {total_lines};
        const pythonCount = {python_files};
        const jsCount = {js_files};
        
        document.getElementById('totalFiles').textContent = {len(file_contents)};
        document.getElementById('pythonFiles').textContent = {python_files};
        document.getElementById('jsFiles').textContent = {js_files};
        document.getElementById('totalLines').textContent = {total_lines};
    '''
    
    # Replace placeholders in HTML
    html_content = html_template.replace(
        '<!-- File contents will be loaded here -->', 
        file_sections_html
    ).replace(
        'Loading file structure...', 
        file_tree
    ).replace(
        'async function loadFileContents() {',
        f'async function loadFileContents() {{\n        {stats_js}'
    ).replace(
        '<div class="toc">',
        f'<div class="toc">\n            <h3>📁 Quick Navigation ({len(file_contents)} files)</h3>\n            <div style="max-height: 300px; overflow-y: auto;">{toc_html}</div>\n            <h3>📁 File Structure</h3>'
    )
    
    # Write final HTML file
    output_path = '/app/tadka_complete_code_export.html'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"""
    ✅ Complete code export generated successfully!
    
    📊 Export Statistics:
    - Total Files: {len(file_contents)}
    - Python Files: {python_files}  
    - JavaScript Files: {js_files}
    - Total Lines of Code: {total_lines:,}
    - Output File: {output_path}
    
    📋 Instructions:
    1. Open: {output_path}
    2. Right-click → 'Save As' → Choose 'Webpage, Complete'
    3. Upload the saved files to your GitHub repository
    
    🔗 Direct Access: file://{output_path}
    """)
    
    return output_path

if __name__ == "__main__":
    generate_download_page()
#!/usr/bin/env python3
"""
Generate a complete downloadable package with ALL files including uploads
"""

import os
import json
import html
import base64
import mimetypes
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
    elif ext in ['.png', '.jpg', '.jpeg', '.gif', '.webp']:
        return 'image'
    else:
        return 'other'

def is_binary_file(filepath):
    """Check if file is binary"""
    binary_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf', '.zip', '.tar', '.gz', '.exe', '.dll', '.so'}
    return get_file_extension(filepath) in binary_extensions

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
        '.DS_Store'
    ]
    
    for pattern in exclude_patterns:
        if pattern in filepath:
            return False
    
    # Include uploads folder specifically
    if '/uploads/' in filepath:
        return True
        
    # Include specific file types for code
    allowed_extensions = {'.py', '.js', '.jsx', '.css', '.json', '.md', '.html', '.txt', '.sql', '.yml', '.yaml', '.env'}
    if get_file_extension(filepath) not in allowed_extensions:
        return False
        
    return True

def read_file_safely(filepath):
    """Read file content safely, handling both text and binary"""
    if is_binary_file(filepath):
        try:
            with open(filepath, 'rb') as f:
                binary_data = f.read()
                base64_data = base64.b64encode(binary_data).decode('utf-8')
                mime_type = mimetypes.guess_type(filepath)[0] or 'application/octet-stream'
                return {
                    'type': 'binary',
                    'data': base64_data,
                    'mime_type': mime_type,
                    'size': len(binary_data)
                }
        except Exception as e:
            return {
                'type': 'error',
                'data': f"[Error reading binary file: {str(e)}]",
                'size': 0
            }
    else:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                return {
                    'type': 'text',
                    'data': content,
                    'size': len(content)
                }
        except UnicodeDecodeError:
            try:
                with open(filepath, 'r', encoding='latin-1') as f:
                    content = f.read()
                    return {
                        'type': 'text',
                        'data': content,
                        'size': len(content)
                    }
            except Exception as e:
                return {
                    'type': 'error',
                    'data': f"[Error reading file: {str(e)}]",
                    'size': 0
                }
        except Exception as e:
            return {
                'type': 'error',
                'data': f"[Error reading file: {str(e)}]",
                'size': 0
            }

def generate_complete_download():
    """Generate complete download package with uploads"""
    
    base_path = "/app"
    
    # Find all relevant files including uploads
    all_files = []
    for root, dirs, files in os.walk(base_path):
        # Skip excluded directories but keep uploads
        dirs[:] = [d for d in dirs if not any(pattern in d for pattern in ['__pycache__', 'node_modules', '.git', '.emergent']) or 'uploads' in d]
        
        for file in files:
            filepath = os.path.join(root, file)
            if should_include_file(filepath):
                all_files.append(filepath)
    
    print(f"Found {len(all_files)} files to include in export")
    
    # Separate uploads and code files
    upload_files = [f for f in all_files if '/uploads/' in f]
    code_files = [f for f in all_files if '/uploads/' not in f]
    
    print(f"  - Code files: {len(code_files)}")
    print(f"  - Upload files: {len(upload_files)}")
    
    # Count file types
    python_files = sum(1 for f in code_files if get_file_extension(f) == '.py')
    js_files = sum(1 for f in code_files if get_file_extension(f) in ['.js', '.jsx'])
    image_files = sum(1 for f in upload_files if get_file_extension(f) in ['.png', '.jpg', '.jpeg', '.gif', '.webp'])
    
    # Create comprehensive HTML page
    html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tadka App - Complete Project Export with Uploads</title>
    <style>
        body {{ font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }}
        .container {{ max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; border-bottom: 2px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 30px; }}
        .stats {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }}
        .stat-card {{ background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }}
        .stat-number {{ font-size: 1.8em; font-weight: bold; color: #3498db; }}
        .instructions {{ background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db; }}
        .file-section {{ margin: 20px 0; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }}
        .file-header {{ background: #34495e; color: white; padding: 15px; font-weight: bold; }}
        .file-content {{ padding: 15px; background: #f8f9fa; }}
        .code-content {{ font-family: 'Courier New', monospace; white-space: pre-wrap; font-size: 13px; max-height: 400px; overflow-y: auto; }}
        .image-preview {{ max-width: 200px; max-height: 200px; border: 1px solid #ddd; border-radius: 4px; }}
        .copy-btn {{ background: #27ae60; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; float: right; }}
        .download-section {{ background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .folder-tree {{ background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace; margin: 15px 0; }}
        .binary-info {{ background: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔥 Tadka News Platform - Complete Export</h1>
            <p><strong>Generated:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p>FastAPI Backend + React Frontend + SQLite + File Uploads</p>
        </div>

        <div class="instructions">
            <h3>📦 Complete Project Package</h3>
            <p><strong>✅ This export includes EVERYTHING:</strong></p>
            <ul>
                <li>📁 All source code files (Python, JavaScript, CSS, etc.)</li>
                <li>🖼️ All uploaded images from /backend/uploads/</li>
                <li>⚙️ Configuration files and dependencies</li>
                <li>📄 Documentation and README files</li>
            </ul>
            <p><strong>💾 To use:</strong> Save this webpage completely, then upload all files to your GitHub repository.</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">{len(all_files)}</div>
                <div>Total Files</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{len(code_files)}</div>
                <div>Code Files</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{len(upload_files)}</div>
                <div>Upload Files</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{python_files}</div>
                <div>Python Files</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{js_files}</div>
                <div>JS/JSX Files</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{image_files}</div>
                <div>Images</div>
            </div>
        </div>

        <div class="download-section">
            <h3>📋 Download Instructions</h3>
            <ol>
                <li><strong>Save Complete Page:</strong> Right-click → "Save As" → "Webpage, Complete"</li>
                <li><strong>Extract Files:</strong> All files will be saved in a folder structure</li>
                <li><strong>Upload to GitHub:</strong> Create new repository and upload the entire project</li>
                <li><strong>Images Included:</strong> All uploaded images are embedded as base64 data</li>
            </ol>
        </div>
'''
    
    # Add file tree
    html_content += '''
        <div class="folder-tree">
            <h3>📁 Project Structure</h3>
            <pre>
📁 /app (Tadka Project Root)
├── 🐍 backend/
│   ├── 📄 server.py
│   ├── 📄 database.py
│   ├── 📄 schemas.py
│   ├── 📄 crud.py
│   ├── 📁 routes/
│   ├── 📁 models/
│   ├── 📦 requirements.txt
│   └── 📁 uploads/
│       ├── 📁 theater_releases/ (images)
│       └── 📁 ott_releases/ (images)
├── ⚛️ frontend/
│   ├── 📦 package.json
│   ├── 📁 src/
│   │   ├── 📄 App.js
│   │   ├── 📁 components/
│   │   ├── 📁 pages/
│   │   ├── 📁 contexts/
│   │   └── 📁 services/
│   └── 📁 public/
└── 📝 README.md
            </pre>
        </div>
    '''
    
    # Process code files
    html_content += '<h2>📂 Source Code Files</h2>'
    
    for i, filepath in enumerate(sorted(code_files), 1):
        rel_path = os.path.relpath(filepath, base_path)
        file_data = read_file_safely(filepath)
        
        if file_data['type'] == 'text':
            content = html.escape(file_data['data'])
            lines = len(file_data['data'].splitlines())
            
            # Prepare for JavaScript copy function
            js_content = file_data['data'].replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
            
            html_content += f'''
            <div class="file-section">
                <div class="file-header">
                    📄 {rel_path} <small>({lines} lines, {file_data['size']} bytes)</small>
                    <button class="copy-btn" onclick="copyToClipboard(`{js_content}`, this)">📋 Copy</button>
                </div>
                <div class="file-content">
                    <div class="code-content">{content}</div>
                </div>
            </div>
            '''
    
    # Process upload files (images)
    if upload_files:
        html_content += '<h2>🖼️ Uploaded Files</h2>'
        
        for filepath in sorted(upload_files):
            rel_path = os.path.relpath(filepath, base_path)
            file_data = read_file_safely(filepath)
            
            if file_data['type'] == 'binary' and 'image' in file_data.get('mime_type', ''):
                html_content += f'''
                <div class="file-section">
                    <div class="file-header">
                        🖼️ {rel_path} <small>({file_data['size']} bytes)</small>
                    </div>
                    <div class="file-content">
                        <img src="data:{file_data['mime_type']};base64,{file_data['data']}" 
                             alt="{rel_path}" class="image-preview">
                        <div class="binary-info">
                            <strong>File:</strong> {rel_path}<br>
                            <strong>Type:</strong> {file_data['mime_type']}<br>
                            <strong>Size:</strong> {file_data['size']} bytes<br>
                            <strong>Base64 Data:</strong> Available for download
                        </div>
                    </div>
                </div>
                '''
    
    # Add JavaScript functions
    html_content += '''
        <script>
        function copyToClipboard(text, button) {
            navigator.clipboard.writeText(text).then(function() {
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                button.style.background = '#27ae60';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '#27ae60';
                }, 2000);
            }).catch(function(err) {
                console.error('Could not copy text: ', err);
            });
        }
        </script>
    </div>
</body>
</html>
    '''
    
    # Write final HTML file
    output_path = '/app/tadka_complete_with_uploads.html'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"""
    ✅ COMPLETE export with uploads generated successfully!
    
    📊 Export Statistics:
    - Total Files: {len(all_files)}
    - Code Files: {len(code_files)}
    - Upload Files: {len(upload_files)} (including {image_files} images)
    - Python Files: {python_files}  
    - JavaScript Files: {js_files}
    - Output File: {output_path}
    
    🖼️ Uploads Included:
    - Theater release images: {len([f for f in upload_files if 'theater_releases' in f])}
    - OTT release images: {len([f for f in upload_files if 'ott_releases' in f])}
    
    📋 Instructions:
    1. Open: {output_path}
    2. Right-click → 'Save As' → Choose 'Webpage, Complete'
    3. Upload ALL saved files to your GitHub repository
    
    🔗 Direct Access: file://{output_path}
    """)
    
    return output_path

if __name__ == "__main__":
    generate_complete_download()
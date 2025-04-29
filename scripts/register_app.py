import sys
import os

def register_app(app_name):
    settings_path = "transcendence/settings/base.py"
    apps_file_path = f"apps/{app_name}/apps.py"
    
    # Read the current content of settings.py
    with open(settings_path, 'r') as file:
        lines = file.readlines()
    
    # Find INSTALLED_APPS and insert the new app
    for i, line in enumerate(lines):
        if 'INSTALLED_APPS = [' in line:
            lines.insert(i + 1, f"    'apps.{app_name}',\n")
            break
    
    # Write back the modified content to settings.py
    with open(settings_path, 'w') as file:
        file.writelines(lines)

    # Update the app's apps.py file
    if os.path.exists(apps_file_path):
        with open(apps_file_path, 'r') as file:
            content = file.read()
        
        # Replace the name = '<app_name>' with name = 'apps.<app_name>'
        updated_content = content.replace(f"name = '{app_name}'", f"name = 'apps.{app_name}'")
        
        with open(apps_file_path, 'w') as file:
            file.write(updated_content)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python register_app.py <app_name>")
        sys.exit(1)
    
    register_app(sys.argv[1]) 
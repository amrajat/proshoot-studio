# Repository Separation Guide: V2 Branch to Proshoot Studio

## Overview
This guide documents the process of separating the V2 branch from the main Headsshot.com repository into a new standalone repository called "proshoot-studio" for deployment at studio.proshoot.co.

## Repository Structure

### Current Setup
- **Main Repository**: headsshot.com (hosted at proshoot.co)
- **V2 Branch**: Contains the studio application
- **Target**: New repository "proshoot-studio" for studio.proshoot.co

### Separation Strategy
1. Create new repository from V2 branch
2. Maintain git history for the V2 branch
3. Set up new remote for proshoot-studio
4. Configure deployment for studio subdomain

## Git Commands for Repository Separation

### Step 1: Create New Repository Directory
```bash
# Create a new directory for the studio repository
mkdir proshoot-studio
cd proshoot-studio

# Initialize new git repository
git init
```
**Purpose**: Creates a fresh git repository for the studio application.

### Step 2: Add Original Repository as Remote
```bash
# Add the original repository as a remote
git remote add origin-repo /path/to/headsshot.com
```
**Purpose**: Links to the original repository to fetch the V2 branch.

### Step 3: Fetch V2 Branch
```bash
# Fetch all branches from the original repository
git fetch origin-repo

# Create and checkout the V2 branch
git checkout -b main origin-repo/V2
```
**Purpose**: Brings the V2 branch content into the new repository as the main branch.

### Step 4: Remove Original Remote
```bash
# Remove the temporary remote
git remote remove origin-repo
```
**Purpose**: Cleans up the temporary connection to the original repository.

### Step 5: Create GitHub Repository
```bash
# Create repository on GitHub (via GitHub CLI or web interface)
gh repo create proshoot-studio --public --description "AI Headshot Studio Application"

# Or manually create on GitHub web interface
```
**Purpose**: Creates the new repository on GitHub for hosting.

### Step 6: Add New Remote and Push
```bash
# Add the new GitHub repository as origin
git remote add origin https://github.com/yourusername/proshoot-studio.git

# Push the main branch to the new repository
git push -u origin main
```
**Purpose**: Establishes the new repository as the primary remote and uploads the code.

## Alternative Method: Using git subtree

### Step 1: Extract V2 Branch as Subtree
```bash
# From the original repository
cd /path/to/headsshot.com

# Create a new branch from V2
git checkout V2
git checkout -b studio-export

# Push to create the new repository
git subtree push --prefix=. https://github.com/yourusername/proshoot-studio.git main
```
**Purpose**: Uses git subtree to cleanly separate the branch while maintaining history.

## Recommended Approach: Clean Separation

### Step 1: Clone and Filter
```bash
# Clone the original repository
git clone https://github.com/yourusername/headsshot.com.git proshoot-studio
cd proshoot-studio

# Checkout the V2 branch
git checkout V2

# Create new main branch from V2
git checkout -b main

# Remove old remotes
git remote remove origin
```

### Step 2: Clean Up History (Optional)
```bash
# If you want to clean up commit history
git filter-branch --prune-empty --subdirectory-filter . HEAD

# Or use git filter-repo (recommended)
git filter-repo --force
```

### Step 3: Set Up New Remote
```bash
# Add new GitHub repository
git remote add origin https://github.com/yourusername/proshoot-studio.git

# Push to new repository
git push -u origin main
```

## Post-Separation Tasks

### 1. Update Package.json
```json
{
  "name": "proshoot-studio",
  "description": "AI Headshot Studio Application",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/proshoot-studio.git"
  }
}
```

### 2. Update Environment Variables
- Copy `.env.example` to `.env.local`
- Update domain-specific environment variables
- Configure for studio.proshoot.co deployment

### 3. Update Documentation
- Update README.md for the studio application
- Remove marketing site specific documentation
- Add studio-specific setup instructions

### 4. Configure Deployment
- Set up Vercel project for studio.proshoot.co
- Configure custom domain
- Set up environment variables in Vercel

## Deployment Configuration

### Vercel Setup
1. Import the new proshoot-studio repository
2. Configure build settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. Set up custom domain: studio.proshoot.co
4. Configure environment variables

### Domain Configuration
- Add CNAME record: `studio.proshoot.co` → Vercel
- Configure SSL certificate
- Update CORS settings for new domain

## Maintenance Strategy

### Keeping Repositories in Sync
If you need to sync changes between repositories:

```bash
# Add original repository as upstream
git remote add upstream https://github.com/yourusername/headsshot.com.git

# Fetch changes from V2 branch
git fetch upstream V2

# Merge or cherry-pick specific changes
git merge upstream/V2
# or
git cherry-pick <commit-hash>
```

### Branch Management
- **main**: Production branch for studio.proshoot.co
- **develop**: Development branch for new features
- **feature/***: Feature branches for specific enhancements

## Benefits of Separation

### 1. Independent Deployment
- Studio app can be deployed independently
- Different deployment schedules and strategies
- Isolated environment configurations

### 2. Focused Development
- Studio-specific features and improvements
- Cleaner codebase without marketing site code
- Easier maintenance and debugging

### 3. Scalability
- Independent scaling for studio application
- Separate monitoring and analytics
- Dedicated resources and optimization

### 4. Team Management
- Different access permissions
- Studio-focused development team
- Separate CI/CD pipelines

## Rollback Strategy

If issues arise, you can always:
1. Keep the original V2 branch in the main repository
2. Revert to the original deployment
3. Merge changes back to the main repository if needed

## Security Considerations

### Environment Variables
- Ensure all secrets are properly configured
- Use different API keys for production
- Implement proper CORS settings

### Access Control
- Set up proper GitHub repository permissions
- Configure Vercel team access
- Implement deployment protection rules

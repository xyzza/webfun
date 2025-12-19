.PHONY: run build preview clean install

# Run development server on port 3000
run:
	npm run dev

# Build the project
build:
	npm run build

# Preview production build
preview:
	npm run preview

# Install dependencies
install:
	npm install

# Clean build artifacts
clean:
	rm -rf dist node_modules

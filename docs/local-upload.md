# Local Source Upload

The original application archive is ready locally. Because the connected GitHub integration does not expose a bulk local-folder upload operation, the application source should be pushed from the development machine.

## 1. Extract the archive

Extract `belagavi-city-bus-service.zip` and open the extracted project directory in VS Code.

## 2. Verify the project identity

The repository package name should be:

```json
"name": "belagavi-city-bus-transit"
```

## 3. Install dependencies

```bash
npm install
```

## 4. Validate locally

```bash
npm run lint
npm run build
```

## 5. Initialize Git if necessary

```bash
git init
git branch -M main
git remote add origin https://github.com/ABHILATTHE6/BELGAVI-BUS-TRANSIT.git
```

If `origin` already exists, do not add it again.

## 6. Protect secrets

Do not upload `.env`. Keep `.env.example` only.

## 7. Upload the application source

```bash
git add .
git commit -m "feat: migrate initial transit application source"
git push -u origin main
```

## 8. Verify GitHub Actions

After pushing, open the repository's **Actions** tab and confirm that the CI workflow starts.

## 9. Next verification

After the source is present on GitHub, the next engineering step is to fix any lint/build/CI failures before adding new features.

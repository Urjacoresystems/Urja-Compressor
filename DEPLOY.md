# Deploy to AWS EC2

## 1. Prepare an Ubuntu EC2 instance

Install Docker Engine and the Compose plugin on the instance:

```sh
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

Reconnect after adding the EC2 user to the `docker` group.

In the instance's security group, allow inbound TCP traffic on ports **80** and **443**. The Compose service maps port 80 to the app; HTTPS on port 443 requires a TLS terminator such as an Application Load Balancer or a reverse proxy.

## 2. Copy the Compose file

Create the deployment directory and copy `docker-compose.yml` into the EC2 user's home directory:

```sh
ssh -i /path/to/ec2-key.pem EC2_USER@EC2_HOST 'mkdir -p ~/urja-compressor'
scp -i /path/to/ec2-key.pem docker-compose.yml EC2_USER@EC2_HOST:~/urja-compressor/docker-compose.yml
```

Replace `EC2_USER`, `EC2_HOST`, and the key path with your instance details.

## 3. Add GitHub Actions secrets

In the GitHub repository, open **Settings → Secrets and variables → Actions** and add:

- `EC2_HOST` — the instance's public DNS name or IP address.
- `EC2_USER` — the SSH user on the instance.
- `EC2_SSH_KEY` — the private SSH key for that user.

The workflow uses the run's `GITHUB_TOKEN` to publish to and pull from GitHub Container Registry; no separate registry token is required. Ensure the repository has permission to publish the package.

## 4. Deploy

Push to `main`. GitHub Actions builds the app on pushes and pull requests. On pushes to `main`, it also publishes `latest` and the commit-SHA image tags to GHCR, then connects to EC2 and restarts the Compose service.

## Local Docker test

Run these commands from the repository root:

```sh
docker build -t urja .
docker run -p 3000:3000 urja
```

Then open `http://localhost:3000`.

## Dependencies

The project uses pnpm with the root `pnpm-lock.yaml`. Docker and GitHub Actions both install from that file with `--frozen-lockfile`, so add packages with `pnpm add` (Replit does this) and commit the updated `pnpm-lock.yaml`. `package-lock.json` is no longer used.

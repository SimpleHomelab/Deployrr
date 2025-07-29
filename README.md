# Deployrr

> Transform your homelab setup from complex to click! Deployrr is your all-in-one solution for automated Docker-based homelab deployment.

[![Apps Supported](images/v5/2025_07_29_deployrr_145.png)](APPS.md)

## What is Deployrr?

Deployrr revolutionizes homelab setup by automating the deployment and configuration of Docker and Docker Compose environments. Whether you're a homelab enthusiast or a professional sysadmin, Deployrr streamlines the process of setting up and managing your containerized applications.

### Key Features

- **Extensive App Support**: 145+ pre-configured applications ready for deployment
- **Intelligent Automation**: Automated environment setup with smart system checks
- **Enterprise-Grade Security**:
  - Socket-Proxy protection
  - CrowdSec integration
  - Multiple authentication options (Authentik, Authelia, TinyAuth, Google OAuth)
- **Professional Networking**:
  - Advanced Traefik reverse proxy configuration
  - Flexible exposure modes (Internal, External, or Hybrid)
  - Multi-server and multi-domain support
- **Smart Management**:
  - Intuitive stack management interface
  - Automated backup and restoration
  - Comprehensive monitoring and logging
  - Remote share mounting (SMB, NFS, Rclone)

## Quick Start

```bash
bash -c "$(curl -fsSL https://www.deployrr.app/install.sh)"
```

## Impact & Growth
![Deployrr Stats](images/v5/2025_07_29_deployrr_stats.png)

# Supported Apps
Deployrr can automatically setup Socket Proxy, Traefik (fetch LE SSL certificates), Authentik, Authelia, TinyAuth, Portainer, Plex, Jellyfin, Starr Apps, Gluetun, Dozzle, Uptime-Kuma, Homepage, CrowdSec, and other apps. 

[Full List of Apps](APPS.md)

## Learn More

- [Official Documentation](https://www.simplehomelab.com/deployrr/)
- [Quick Start Guide (20 min)](https://www.simplehomelab.com/go/deployarr-v5-intro/)
- [Comprehensive Tutorial](https://www.simplehomelab.com/go/deployarr-v5-detailed-guide/)

## Supported Environments

- **Primary Platform**: Ubuntu and Debian-based systems
- **Deployment Options**: Baremetal, VM, Windows WSL, and LXC environments

## License Options

Deployrr offers flexible licensing to suit different needs:

- **Free Tier**: Essential features for basic setups
- **Paid Tiers**: 
  - Basic
  - Plus
  - Pro
  
[View Detailed Comparison](https://www.simplehomelab.com/deployrr/pricing/)

Note: Annual [website memberships](https://www.simplehomelab.com/membership-account/join-the-geek-army/) include full Deployrr access!

## Support & Community

Join our thriving community:
- [Deployrr Docs](https://docs.deployrr.app) - Answers to many common questions, fixes for issues, and improvement ideas
- [Discord Community](https://www.simplehomelab.com/discord/) - Get help and share experiences
- [YouTube Channel](https://www.youtube.com/@Simple-Homelab) - Tutorial videos and updates

## Project Vision

Deployrr isn't just another container manager - it's your pathway to homelab mastery. Our goal is to:
- Simplify complex deployments
- Enable rapid testing and experimentation
- Foster learning through hands-on experience
- Provide quick recovery options when needed

## Feature Showcase

<details>
<summary>Click to view screenshots</summary>

#### Dashboard & Management
![Deployrr Dashboard](images/v5/11a%20Deployarr%20v5%20Deployarr%20Dashboard.png)
![Stack Manager](images/v5/13%20Deployarr%20v5%20Stack%20Manager.png)

#### Setup & Configuration
![System Checks](images/v5/02a%20system%20checks%20output.png)
![Security Options](images/v5/09%20Deployarr%20v5%20Security%20Options.png)

[View More Screenshots](#screenshots)
</details>

## Known Limitations

- DNS Challenge Provider: Currently Cloudflare-only
- Port forwarding requirements: 80/443
- Specific database-dependent apps may require manual database removal

## Contributing to Open Source

Part of Deployrr's revenue supports open-source projects through [OpenCollective](https://opencollective.com/deployrr).

---

<div align="center">

**Transform your homelab journey with Deployrr**

[Get Started](https://www.simplehomelab.com/deployrr/) | [Join Discord](https://www.simplehomelab.com/discord/) | [Watch Tutorial](https://www.simplehomelab.com/go/deployarr-v5-intro/)

</div>


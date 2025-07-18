# 🚀 GatherGuru AWS Free Tier Deployment Guide

This guide will help you deploy your GatherGuru application to AWS Free Tier using t3.micro instance with local file storage.

## 📋 Free Tier Overview

### AWS Free Tier Limits
- **EC2**: t3.micro instance (1 vCPU, 1 GB RAM)
- **Storage**: 8 GB gp3 EBS volume
- **Bandwidth**: 15 GB data transfer out
- **Duration**: 12 months

### Application Optimizations for Free Tier
- ✅ Local file storage (no S3 costs)
- ✅ Single PM2 instance (no clustering)
- ✅ Reduced memory limits (512MB)
- ✅ Optimized rate limiting
- ✅ File size limits (5MB)
- ✅ Daily maintenance scripts

---

## 🏗️ Architecture (Free Tier)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Route 53      │    │   Nginx         │    │   Node.js       │
│   (Domain)      │───▶│   (Reverse      │───▶│   (Backend)     │
│   (Optional)    │    │    Proxy)       │    │   + Frontend    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local Storage │    │   PM2           │    │   MongoDB Atlas │
│   (Uploads)     │◀───│   (Process      │◀───│   (Free Tier)   │
│   (8GB limit)   │    │    Manager)     │    │   (512MB)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📝 Step-by-Step Free Tier Deployment

### Phase 1: AWS Setup

#### 1.1 Create EC2 Instance (Free Tier)

1. **Launch EC2 Instance**:
   - Go to AWS Console → EC2 → Launch Instance
   - **Name**: `gatherguru-free-tier`
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type**: t3.micro (Free tier eligible)
   - **Storage**: 8 GB gp3 (Free tier limit)
   - **Security Group**: Create new with rules:
     - SSH (22): Your IP only
     - HTTP (80): 0.0.0.0/0
     - HTTPS (443): 0.0.0.0/0 (optional)
   - **Key Pair**: Create new key pair

2. **Connect to Instance**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   ```

#### 1.2 Set Up MongoDB Atlas (Free Tier)

1. **Create MongoDB Atlas Account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Choose "Free" tier (M0)
   - Select AWS as cloud provider
   - Choose region close to your EC2

2. **Configure Network Access**:
   - Add your EC2 public IP to IP Access List
   - Or temporarily add `0.0.0.0/0` for testing

3. **Create Database User**:
   - Username: `gatherguru`
   - Password: Strong password
   - Save connection string

---

### Phase 2: Application Deployment

#### 2.1 Prepare Your Code

1. **Update Backend Environment**:
   ```bash
   # Backend/.env
   MONGO_URI=mongodb+srv://gatherguru:password@cluster.mongodb.net/gatherguru
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=production
   PORT=5000
   ALLOWED_ORIGINS=http://your-ec2-public-ip,http://your-domain.com
   MAX_FILE_SIZE=5242880
   ```

2. **Update Frontend Environment**:
   ```bash
   # Frontend/.env
   VITE_API_URL=http://your-ec2-public-ip/api
   # or https://your-domain.com/api if using domain
   ```

#### 2.2 Deploy to EC2

1. **Upload Code**:
   ```bash
   # From your local machine
   scp -i your-key.pem -r . ubuntu@your-ec2-public-ip:/home/ubuntu/gatherguru
   ```

2. **Run Deployment Script**:
   ```bash
   # On EC2 instance
   cd /home/ubuntu/gatherguru
   chmod +x deploy.sh
   sudo ./deploy.sh
   ```

3. **Configure Environment**:
   ```bash
   sudo nano /var/www/gatherguru/.env
   # Add your production environment variables
   ```

---

### Phase 3: Domain Setup (Optional)

#### 3.1 Route 53 Setup (Optional)

1. **Register Domain** (if you don't have one):
   - Go to Route 53 → Registered Domains
   - Register a domain (~$12/year)

2. **Create Hosted Zone**:
   - Route 53 → Hosted Zones → Create Hosted Zone
   - Add A record pointing to your EC2 public IP

3. **Update Nginx Configuration**:
   ```bash
   sudo nano /etc/nginx/sites-available/gatherguru
   # Replace 'your-domain.com' with your actual domain
   sudo nginx -t
   sudo systemctl restart nginx
   ```

#### 3.2 SSL Certificate (Optional)

1. **Install Certbot**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Get SSL Certificate**:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

---

### Phase 4: Monitoring and Maintenance

#### 4.1 Check Application Status

```bash
# Check PM2 status
pm2 status
pm2 logs

# Check nginx status
sudo systemctl status nginx

# Check disk usage
df -h

# Check memory usage
free -h
```

#### 4.2 Monitor Free Tier Usage

1. **AWS Billing Dashboard**:
   - Monitor your usage in AWS Billing Console
   - Set up billing alerts

2. **Application Monitoring**:
   ```bash
   # Health check
   curl http://your-ec2-public-ip/health

   # Check upload directory size
   du -sh /var/www/gatherguru/uploads
   ```

---

## 🔧 Free Tier Optimizations

### Memory Management
- **Node.js**: Limited to 512MB heap
- **PM2**: Single instance, no clustering
- **Nginx**: Optimized for low memory usage

### Storage Management
- **File Uploads**: Limited to 5MB per file
- **Automatic Cleanup**: Old files deleted after 30 days
- **Log Rotation**: Logs cleaned up after 7 days

### Performance Optimizations
- **Gzip Compression**: Enabled for all text files
- **Static File Caching**: 30-day cache for uploads
- **Rate Limiting**: 50 requests per 15 minutes

---

## 🚨 Free Tier Limitations & Solutions

### Memory Limitations (1GB RAM)
**Issues**: Application crashes, slow performance
**Solutions**:
- Monitor memory usage: `free -h`
- Restart application if needed: `pm2 restart all`
- Consider upgrading if consistently hitting limits

### Storage Limitations (8GB)
**Issues**: Disk full, upload failures
**Solutions**:
- Monitor disk usage: `df -h`
- Clean up old files: `/var/www/gatherguru/maintenance.sh`
- Consider S3 migration for large files

### Bandwidth Limitations (15GB/month)
**Issues**: Slow loading, timeouts
**Solutions**:
- Enable gzip compression
- Optimize images
- Monitor bandwidth usage in AWS Console

---

## 📊 Cost Breakdown (Free Tier)

### Monthly Costs (First 12 Months)
- **EC2 t3.micro**: $0.00
- **EBS 8GB**: $0.00
- **Data Transfer**: $0.00 (up to 15GB)
- **Route 53**: $0.50/month (if using domain)
- **MongoDB Atlas**: $0.00 (free tier)

**Total**: ~$0.50/month (with domain)

### After 12 Months
- **EC2 t3.micro**: ~$8.00/month
- **EBS 8GB**: ~$0.80/month
- **Data Transfer**: ~$0.09/GB after 15GB
- **Route 53**: $0.50/month
- **MongoDB Atlas**: $0.00 (free tier continues)

**Total**: ~$9.30/month

---

## 🔄 Scaling Strategy

### When to Upgrade from Free Tier

1. **Memory Issues**:
   - Application crashes frequently
   - Response times > 5 seconds
   - Memory usage consistently > 80%

2. **Storage Issues**:
   - Disk usage > 7GB
   - File upload failures
   - Need for larger files

3. **Traffic Issues**:
   - > 100 concurrent users
   - Bandwidth usage > 10GB/month
   - Rate limiting frequently triggered

### Upgrade Path
1. **t3.small**: 2 vCPU, 2GB RAM (~$16/month)
2. **Add S3**: For file storage (~$0.023/GB)
3. **Add CloudFront**: For CDN (~$0.085/GB)
4. **ECS Fargate**: For auto-scaling (~$50-150/month)

---

## 🆘 Troubleshooting

### Common Free Tier Issues

1. **Application Won't Start**:
   ```bash
   pm2 logs
   pm2 restart all
   # Check memory: free -h
   ```

2. **File Upload Fails**:
   ```bash
   # Check disk space
   df -h
   # Check upload directory permissions
   ls -la /var/www/gatherguru/uploads
   ```

3. **Slow Performance**:
   ```bash
   # Check memory usage
   free -h
   # Check CPU usage
   top
   # Restart application
   pm2 restart all
   ```

4. **Domain Not Working**:
   ```bash
   # Check nginx configuration
   sudo nginx -t
   # Check nginx status
   sudo systemctl status nginx
   ```

### Emergency Procedures

1. **Application Down**:
   ```bash
   pm2 restart all
   sudo systemctl restart nginx
   ```

2. **Disk Full**:
   ```bash
   # Clean up old files
   /var/www/gatherguru/maintenance.sh
   # Remove old logs
   sudo find /var/log -name "*.log" -mtime +7 -delete
   ```

3. **Memory Issues**:
   ```bash
   # Restart application
   pm2 restart all
   # Check for memory leaks
   pm2 monit
   ```

---

## 📞 Support & Resources

### Useful Commands
```bash
# Application management
pm2 status
pm2 logs
pm2 monit
pm2 restart all

# System monitoring
df -h
free -h
top
htop

# Nginx management
sudo nginx -t
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log

# Maintenance
/var/www/gatherguru/maintenance.sh
```

### Monitoring Endpoints
- **Health Check**: `http://your-ip/health`
- **Application**: `http://your-ip`
- **Uploads**: `http://your-ip/uploads/`

---

## 🎉 Success Checklist

- [ ] EC2 instance running (t3.micro)
- [ ] MongoDB Atlas connected
- [ ] Application deployed and running
- [ ] Domain configured (optional)
- [ ] SSL certificate installed (optional)
- [ ] Monitoring set up
- [ ] Maintenance scripts running
- [ ] Health check responding
- [ ] File uploads working
- [ ] Free tier usage monitored

---

*This guide is optimized for AWS Free Tier. For production deployments, consider the full deployment guide with auto-scaling and managed services.* 
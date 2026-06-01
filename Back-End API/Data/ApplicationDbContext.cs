using AngularProject.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AngularProject.Data
{
    public class ApplicationDbContext : IdentityDbContext<AppUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Product>(mb =>
            {
                mb.Property(p => p.ProductName).IsRequired();
                mb.Property(p => p.Description).IsRequired();
                mb.Property(p => p.Price).IsRequired().HasPrecision(18, 2);
                mb.HasData(
                    new Product { ProductID = 1, ProductName = "Teclado Gamer", Description = "Description 1", Price = 10.0m },
                    new Product { ProductID = 2, ProductName = "Mouse Gamer", Description = "Description 2", Price = 20.0m },
                    new Product { ProductID = 3, ProductName = "Impressora 3D", Description = "Description 3", Price = 30.0m },
                    new Product { ProductID = 4, ProductName = "Teclado Mecânico", Description = "Description 4", Price = 40.0m }
                );
            });

            modelBuilder.Entity<Category>(mb =>
            {
                mb.Property(c => c.CategoryName).IsRequired();
                mb.HasData(
                    new Category { CategoryID = 1, CategoryName = "Peripheral" },
                    new Category { CategoryID = 2, CategoryName = "Keyboards" },
                    new Category { CategoryID = 3, CategoryName = "Mouses" },
                    new Category { CategoryID = 4, CategoryName = "Printers" }
                );
            });

            modelBuilder.Entity<ProductCategory>(mb =>
            {
                mb.HasKey(pc => new { pc.ProductID, pc.CategoryID });
                mb.HasData(
                    new ProductCategory { ProductID = 1, CategoryID = 2 },
                    new ProductCategory { ProductID = 2, CategoryID = 3 },
                    new ProductCategory { ProductID = 3, CategoryID = 4 },
                    new ProductCategory { ProductID = 4, CategoryID = 2 }
                );
            });

            modelBuilder.Entity<Order>(mb =>
            {
                mb.Property(o => o.OrderDate).IsRequired();
                mb.Property(o => o.TotalAmount).IsRequired().HasPrecision(18,2);

                mb.HasOne(o => o.User)
                    .WithMany(u => u.Orders)
                    .HasForeignKey(o => o.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

            });

            modelBuilder.Entity<ShoppingCart>(mb =>
            {
                mb.HasKey(sc => sc.CartID);
                mb.HasOne(sc => sc.User)
                    .WithMany(u => u.ShoppingCarts)
                    .HasForeignKey(sc => sc.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<CartItem>(mb =>
            {
                mb.Property(c => c.Quantity).IsRequired();
                mb.HasData(
                    new CartItem { CartItemID = 1, CartID = 1, ProductID = 1, Quantity = 2 }
                );
            });

            modelBuilder.Entity<Stock>(mb =>
            {
                mb.Property(s => s.Quantity).IsRequired();
                mb.HasData(
                    new Stock { StockID = 1, ProductID = 1, Quantity = 100 },
                    new Stock { StockID = 2, ProductID = 2, Quantity = 100 },
                    new Stock { StockID = 3, ProductID = 3, Quantity = 100 },
                    new Stock { StockID = 4, ProductID = 4, Quantity = 100 }
                );
            });
        }

        public DbSet<Product> Product { get; set; }
        public DbSet<Stock> Stock { get; set; }
        public DbSet<Order> Order { get; set; }
        public DbSet<CartItem> CartItem { get; set; }
        public DbSet<ShoppingCart> ShoppingCart { get; set; }
        public DbSet<Category> Category { get; set; }
        public DbSet<ProductCategory> ProductCategory { get; set; }
    }
}

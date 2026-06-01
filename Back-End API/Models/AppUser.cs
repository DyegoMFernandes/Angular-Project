using Microsoft.AspNetCore.Identity;

namespace AngularProject.Models
{
    public class AppUser : IdentityUser
    {
        public ICollection<Order> Orders { get; set; } = [];
        public ICollection<ShoppingCart> ShoppingCarts { get; set; } = [];
    }
}

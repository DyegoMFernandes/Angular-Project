using AngularProject.Data;
using AngularProject.Models;
using FluentValidation;

namespace Enquiry_App.EntityConfiguration
{
    public class ShoppingCartConfiguration : AbstractValidator<ShoppingCart>
    {
        private readonly ApplicationDbContext _context;
        public ShoppingCartConfiguration(ApplicationDbContext context)
        {
            _context = context;
        }
    }
}

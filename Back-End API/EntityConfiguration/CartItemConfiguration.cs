using AngularProject.Data;
using AngularProject.Models;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Enquiry_App.EntityConfiguration
{
    public class CartItemConfiguration : AbstractValidator<CartItem>
    {
        private readonly ApplicationDbContext _context;
        public CartItemConfiguration(ApplicationDbContext context)
        {
            _context = context;
            RuleFor(c => c.Quantity).GreaterThan(0).WithMessage("Quantity must be greater than 0.")
                .MustAsync(async (cartItem, quantity, cancellation) =>
                {
                    var stock = await _context.Stock.FirstOrDefaultAsync(s => s.ProductID == cartItem.ProductID);
                    if (stock == null)
                        return false;
                    return stock.Quantity >= quantity;
                }).WithMessage("Insufficient stock.");
        }
    }
}

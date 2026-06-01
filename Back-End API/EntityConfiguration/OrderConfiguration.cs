using AngularProject.Data;
using AngularProject.Models;
using FluentValidation;

namespace Enquiry_App.EntityConfiguration
{
    public class OrderConfiguration : AbstractValidator<Order>
    {
        private readonly ApplicationDbContext _context;
        public OrderConfiguration(ApplicationDbContext context)
        {
            _context = context;
            RuleFor(o => o.OrderDate).NotEmpty().WithMessage("Order date is required.");
            RuleFor(o => o.TotalAmount).GreaterThan(0).WithMessage("Total amount must be greater than zero.");
        }
    }
}

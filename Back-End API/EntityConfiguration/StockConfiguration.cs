using AngularProject.Data;
using AngularProject.Models;
using FluentValidation;

namespace Enquiry_App.EntityConfiguration
{
    public class StockConfiguration : AbstractValidator<Stock>
    {
        private readonly ApplicationDbContext _context;
        public StockConfiguration(ApplicationDbContext context)
        {
            _context = context;
            RuleFor(s => s.Quantity).NotEmpty().WithMessage("Quantity is required.")
                .GreaterThanOrEqualTo(0).WithMessage("Quantity must be greater than or equal to zero.");
        }
    }
}

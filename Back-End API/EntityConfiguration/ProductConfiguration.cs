using AngularProject.Data;
using AngularProject.Models;
using FluentValidation;

namespace Enquiry_App.EntityConfiguration
{
    public class ProductConfiguration : AbstractValidator<Product>
    {
        private readonly ApplicationDbContext _context;
        public ProductConfiguration(ApplicationDbContext context)
        {
            _context = context;
            RuleFor(p => p.ProductName).NotEmpty().WithMessage("Product name is required.")
                .MaximumLength(50).WithMessage("Product name cannot exceed 50 characters.")
                .MinimumLength(3).WithMessage("Product name must be at least 3 characters.");
            RuleFor(p => p.Description).NotEmpty().WithMessage("Description is required.")
                .MaximumLength(200).WithMessage("Description cannot exceed 200 characters.")
                .MinimumLength(5).WithMessage("Description must be at least 5 characters.");
            RuleFor(p => p.Price).NotEmpty().WithMessage("Price is required.")
                .GreaterThan(0).WithMessage("Price must be greater than 0.");


        }
    }
}

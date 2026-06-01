using AngularProject.Data;
using AngularProject.Models;
using FluentValidation;

namespace Enquiry_App.EntityConfiguration
{
    public class CategoryConfiguration : AbstractValidator<Category>
    {
        private readonly ApplicationDbContext _context;
        public CategoryConfiguration(ApplicationDbContext context)
        {
            _context = context;
            RuleFor(p => p.CategoryName).NotEmpty().WithMessage("Category name is required.")
                .MaximumLength(50).WithMessage("Category name cannot exceed 50 characters.")
                .MinimumLength(3).WithMessage("Category name must be at least 3 characters.");
        }
    }
}

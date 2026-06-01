using System.ComponentModel.DataAnnotations.Schema;

namespace AngularProject.Models
{
    [Table("ShoppingCart")]
    public class ShoppingCart
    {
        public int CartID { get; set; }
        public string UserId { get; set; } = string.Empty;

        [ForeignKey(nameof(UserId))]
        public AppUser? User { get; set; }
    }
}

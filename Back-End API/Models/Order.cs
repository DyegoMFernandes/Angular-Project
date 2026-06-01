using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AngularProject.Models
{
    [Table("Orders")]
    public class Order
    {
        public int OrderId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public Decimal TotalAmount { get; set; }

        [ForeignKey(nameof(UserId))]
        public AppUser? User { get; set; }

    }
}

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PawPrint, Shield, Heart, Calendar, Award, Star } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">PetCare</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#services" className="text-sm font-medium hover:text-primary transition-colors">
              Dịch vụ
            </Link>
            <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors">
              Về chúng tôi
            </Link>
            <Link href="#branches" className="text-sm font-medium hover:text-primary transition-colors">
              Chi nhánh
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
              Liên hệ
            </Link>
          </nav>
          <Link href="/login">
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-balance">
              Chăm sóc thú cưng của bạn với tất cả tình yêu thương
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 text-pretty">
              Hệ thống chăm sóc thú cưng chuyên nghiệp với 20 chi nhánh trên toàn quốc. Dịch vụ thú y, spa, khách sạn
              thú cưng và cửa hàng phụ kiện.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Đặt lịch ngay
                </Button>
              </Link>
              <Link href="#services">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  Khám phá dịch vụ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="services" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Dịch vụ của chúng tôi</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg border">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Dịch vụ thú y</h3>
              <p className="text-muted-foreground">
                Khám bệnh, tiêm phòng, điều trị với đội ngũ bác sĩ thú y giàu kinh nghiệm
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg border">
              <Heart className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Spa & Grooming</h3>
              <p className="text-muted-foreground">Dịch vụ tắm, cắt tỉa lông chuyên nghiệp, làm đẹp cho thú cưng</p>
            </div>
            <div className="bg-background p-6 rounded-lg border">
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Khách sạn thú cưng</h3>
              <p className="text-muted-foreground">Dịch vụ lưu trú an toàn, thoải mái cho thú cưng khi bạn đi xa</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">20+</div>
              <p className="text-muted-foreground">Chi nhánh</p>
            </div>
            <div>
              <Star className="h-12 w-12 text-primary mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">50K+</div>
              <p className="text-muted-foreground">Khách hàng tin tưởng</p>
            </div>
            <div>
              <PawPrint className="h-12 w-12 text-primary mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">100K+</div>
              <p className="text-muted-foreground">Thú cưng được chăm sóc</p>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Về PetCare</h2>
            <p className="text-muted-foreground text-lg mb-4">
              PetCare là hệ thống chăm sóc thú cưng hàng đầu Việt Nam với 20 chi nhánh trên toàn quốc. Chúng tôi cung
              cấp dịch vụ chăm sóc toàn diện từ y tế, làm đẹp đến lưu trú.
            </p>
            <p className="text-muted-foreground text-lg">
              Với đội ngũ bác sĩ thú y chuyên nghiệp và trang thiết bị hiện đại, chúng tôi cam kết mang đến dịch vụ tốt
              nhất cho những người bạn bốn chân của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center bg-primary text-primary-foreground p-12 rounded-2xl">
            <h2 className="text-3xl font-bold mb-4">Sẵn sàng chăm sóc thú cưng của bạn?</h2>
            <p className="text-lg mb-6 opacity-90">
              Đặt lịch hẹn ngay hôm nay hoặc liên hệ với chúng tôi để được tư vấn
            </p>
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Đặt lịch ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <PawPrint className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">PetCare</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Chăm sóc thú cưng chuyên nghiệp với tất cả tình yêu thương
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Dịch vụ</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Dịch vụ thú y</li>
                <li>Spa & Grooming</li>
                <li>Khách sạn thú cưng</li>
                <li>Cửa hàng phụ kiện</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Công ty</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Về chúng tôi</li>
                <li>Chi nhánh</li>
                <li>Tuyển dụng</li>
                <li>Liên hệ</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Hotline: 1900-xxxx</li>
                <li>Email: info@petcare.vn</li>
                <li>Địa chỉ: TP. Hồ Chí Minh</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 PetCare. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

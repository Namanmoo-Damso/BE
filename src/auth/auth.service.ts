import { Injectable,ConflictException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ){}
      /**
   * 회원가입
   */
    async signup(signupDto: SignupDto) {
    const { email, password, name } = signupDto;

    // 이메일 중복 체크
    const existingUser = await this.userRepository.findOne({
        where: { email },
    });

    if (existingUser) {
        throw new ConflictException('이미 존재하는 이메일입니다');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = this.userRepository.create({
        email,
        password_hash: hashedPassword,
        name,
        auth_type: 'email',
    });

    const savedUser = await this.userRepository.save(user);

    // 비밀번호 제외하고 반환
    const { password_hash, ...result } = savedUser;
    return result;
    }
}
